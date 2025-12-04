# frozen_string_literal: true

require 'sinatra'
require 'json'
require 'zlib'
require_relative 'lib/asset_parser'
require_relative 'lib/markdown_generator'
require_relative 'lib/asset_fetcher'
require_relative 'lib/asset_persister'
require_relative 'lib/component_bundler'

set :port, ENV['PORT'] || 4567
set :bind, '0.0.0.0'
set :public_folder, "#{File.dirname(__FILE__)}/public"

# Configure MIME types for JavaScript modules
mime_type :js, 'application/javascript'
mime_type :mjs, 'application/javascript'

# =============================================================================
# Configuration
# =============================================================================

# Application configuration constants and component registry.
# Provides centralized access to data file paths, component mappings,
# and HTTP cache headers.
class AppConfig
  DATA_FILE = 'data.md'

  # Maps asset types to their component file and custom element name
  COMPONENT_REGISTRY = {
    'company_description' => { file: 'company-description.js', element: 'company-description' },
    'their_story' => { file: 'their-story.js', element: 'their-story' },
    'key_numbers' => { file: 'key-numbers.js', element: 'key-numbers' },
    'funding_parser' => { file: 'funding-parser.js', element: 'funding-parser' },
    'leadership' => { file: 'leadership.js', element: 'leadership-component' },
    'office_locations' => { file: 'office-locations.js', element: 'office-locations' },
    'perks_and_benefits' => { file: 'perks-benefits.js', element: 'perks-benefits' },
    'remote_policy' => { file: 'remote-policy.js', element: 'remote-policy' }
  }.freeze

  NO_CACHE_HEADERS = {
    'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
    'Pragma' => 'no-cache',
    'Expires' => '0'
  }.freeze

  class << self
    def data_file_path
      DATA_FILE
    end

    def component_registry
      COMPONENT_REGISTRY
    end

    def no_cache_headers
      NO_CACHE_HEADERS
    end
  end
end

# =============================================================================
# Middleware
# =============================================================================

before do
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => %w[GET POST PUT DELETE OPTIONS],
          'Access-Control-Allow-Headers' => 'Content-Type'
end

# =============================================================================
# Helper Methods
# =============================================================================

def json_response(success: true, data: {})
  content_type :json
  { success: success, **data }.to_json
end

def error_response(status_code, message)
  status status_code
  json_response(success: false, data: { error: message })
end

def with_error_handling
  yield
rescue AssetFetcher::DataFileNotFound, AssetFetcher::AssetNotFound => e
  error_response(404, e.message)
rescue JSON::ParserError => e
  error_response(400, "Invalid JSON: #{e.message}")
rescue StandardError => e
  error_response(500, e.message)
end

def parse_types_param
  return nil if params[:types].nil? || params[:types].empty?

  params[:types].split(',').map(&:strip)
end

def serve_static_file(file_path, content_type_key)
  validate_file_path_security!(file_path)
  content_type content_type_key
  headers AppConfig.no_cache_headers
  send_file(file_path)
end

def validate_file_path_security!(file_path)
  real_path = File.expand_path(file_path)
  public_path = File.expand_path(settings.public_folder)

  return if real_path.start_with?(public_path)

  status 403
  halt 'Forbidden: Access denied'
end

def content_type_for_file(file_path)
  case File.extname(file_path)
  when '.js', '.mjs' then :js
  when '.css' then :css
  when '.html' then :html
  else :text
  end
end

##
# Check if client accepts gzip encoding
#
def client_accepts_gzip?
  accept_encoding = request.env['HTTP_ACCEPT_ENCODING'] || ''
  accept_encoding.include?('gzip')
end

##
# Compress content with gzip
#
def gzip_compress(content)
  io = StringIO.new
  gz = Zlib::GzipWriter.new(io, Zlib::BEST_COMPRESSION)
  gz.write(content)
  gz.close
  io.string
end

# =============================================================================
# Routes: API
# =============================================================================

get '/api/assets' do
  with_error_handling do
    fetcher = AssetFetcher.new
    types = parse_types_param

    if types
      assets = fetcher.by_types(types)
      json_response(data: { assets: assets, total: fetcher.total_count, filtered: assets.length })
    else
      json_response(data: { assets: fetcher.all, total: fetcher.total_count })
    end
  end
end

get '/api/assets/:type' do
  with_error_handling do
    asset = AssetFetcher.new.find_by_type(params[:type])
    json_response(data: { asset: asset })
  end
end

post '/api/assets' do
  with_error_handling do
    payload = JSON.parse(request.body.read)
    AssetPersister.new.save(payload['assets'])
    json_response(data: { message: 'Assets saved successfully' })
  end
end

get '/api/components' do
  with_error_handling do
    bundler = ComponentBundler.new(public_folder: settings.public_folder)
    types = parse_types_param
    registry = bundler.registry_for(types)

    data = { components: registry, total: AppConfig.component_registry.length }
    data[:filtered] = registry.length if types

    json_response(data: data)
  end
end

get '/api/components/bundle' do
  with_error_handling do
    types = parse_types_param
    halt 400, json_response(success: false, data: { error: 'Missing required parameter: types' }) unless types

    include_base = params[:include_base] != 'false'
    bundler = ComponentBundler.new(public_folder: settings.public_folder)
    bundle_content = bundler.bundle(types: types, include_base: include_base)

    content_type 'application/javascript'
    headers AppConfig.no_cache_headers

    # Return gzipped content if client supports it
    if client_accepts_gzip?
      headers 'Content-Encoding' => 'gzip'
      headers 'Vary' => 'Accept-Encoding'
      gzip_compress(bundle_content)
    else
      bundle_content
    end
  end
end

# =============================================================================
# Routes: Static Files
# =============================================================================

# Handle Chrome DevTools probe silently (avoids ECONNRESET noise)
get '/.well-known/*' do
  status 204
  ''
end

get '/' do
  serve_static_file(File.join(settings.public_folder, 'index.html'), :html)
end

get '/*' do
  file_path = File.join(settings.public_folder, request.path_info)

  unless File.exist?(file_path)
    status 404
    halt "Not Found: #{request.path_info}"
  end

  serve_static_file(file_path, content_type_for_file(file_path))
end

# =============================================================================
# Startup
# =============================================================================

puts "Server starting on http://localhost:#{settings.port}"
