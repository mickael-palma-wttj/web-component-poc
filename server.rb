require 'sinatra'
require 'json'
require_relative 'lib/asset_parser'
require_relative 'lib/markdown_generator'

set :port, ENV['PORT'] || 4567
set :bind, '0.0.0.0'
set :public_folder, File.dirname(__FILE__) + '/public'

# Configure MIME types for JavaScript modules
mime_type :js, 'application/javascript'
mime_type :mjs, 'application/javascript'

# =============================================================================
# Configuration
# =============================================================================

class AppConfig
  DATA_FILE = 'data.md'.freeze

  def self.data_file_path
    DATA_FILE
  end
end

# Cache control headers for static assets (no caching in development)
NO_CACHE_HEADERS = {
  'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
  'Pragma' => 'no-cache',
  'Expires' => '0'
}.freeze

# =============================================================================
# Middleware
# =============================================================================

# Enable CORS for API requests
before do
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          'Access-Control-Allow-Headers' => 'Content-Type'
end

# =============================================================================
# Helper Methods
# =============================================================================

##
# Serve static files from public folder with consistent headers and security
#
# @param file_path [String] Full path to the file
# @param content_type_key [Symbol] Sinatra content type symbol
#
def serve_static_file(file_path, content_type_key)
  # Security: Validate file path is within public folder
  validate_file_path_security!(file_path)

  content_type content_type_key
  headers NO_CACHE_HEADERS
  send_file(file_path)
end

##
# Validate that file path doesn't escape the public folder (path traversal attack)
#
# @param file_path [String] Path to validate
# @raises [RuntimeError] If path is outside public folder
#
def validate_file_path_security!(file_path)
  real_path = File.expand_path(file_path)
  public_path = File.expand_path(settings.public_folder)

  unless real_path.start_with?(public_path)
    status 403
    halt "Forbidden: Access denied"
  end
end

##
# Build JSON API response
#
# @param success [Boolean] Whether operation was successful
# @param data [Hash] Additional response data
# @return [String] JSON string
#
def json_response(success = true, data = {})
  content_type :json
  { success: success, **data }.to_json
end

##
# Determine content type based on file extension
#
# @param file_path [String] Path to file
# @return [Symbol] Sinatra content type symbol
#
def content_type_for_file(file_path)
  case File.extname(file_path)
  when '.js', '.mjs'
    :js
  when '.css'
    :css
  when '.html'
    :html
  else
    :text
  end
end

# =============================================================================
# Routes: API (defined before catch-all routes)
# =============================================================================

##
# GET /api/assets
# Retrieve all assets from data.md
#
get '/api/assets' do
  begin
    data_file = File.read(AppConfig.data_file_path)
    assets = AssetParser.new(data_file).call
    json_response(true, assets: assets)

  rescue Errno::ENOENT
    status 404
    json_response(false, error: 'Data file not found')

  rescue StandardError => e
    status 500
    json_response(false, error: e.message)
  end
end

##
# POST /api/assets
# Save assets back to data.md and regenerate markdown
#
post '/api/assets' do
  begin
    request_payload = JSON.parse(request.body.read)
    assets = request_payload['assets']

    markdown_content = MarkdownGenerator.new(assets).call
    File.write(AppConfig.data_file_path, markdown_content)

    json_response(true, message: 'Assets saved successfully')

  rescue JSON::ParserError => e
    status 400
    json_response(false, error: "Invalid JSON: #{e.message}")

  rescue StandardError => e
    status 500
    json_response(false, error: e.message)
  end
end

# =============================================================================
# Routes: Static Files (catch-all after specific routes)
# =============================================================================

##
# Serve root index.html
#
get '/' do
  file_path = File.join(settings.public_folder, 'index.html')
  serve_static_file(file_path, :html)
end

##
# Serve all static files from public folder with consistent caching headers
# and path traversal protection
#
get '/*' do
  file_path = File.join(settings.public_folder, request.path_info)

  # Return 404 if file doesn't exist
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
