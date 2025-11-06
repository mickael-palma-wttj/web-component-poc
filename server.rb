require 'sinatra'
require 'json'

set :port, 4567
set :bind, '0.0.0.0'
set :public_folder, File.dirname(__FILE__) + '/public'

# Configure MIME types for JavaScript modules
mime_type :js, 'application/javascript'
mime_type :mjs, 'application/javascript'

# Enable CORS for API requests
before do
  headers 'Access-Control-Allow-Origin' => '*',
          'Access-Control-Allow-Methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
          'Access-Control-Allow-Headers' => 'Content-Type'
end

# Serve JavaScript files with correct MIME type and no caching in development
get '/*.js' do
  content_type :js
  headers 'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma' => 'no-cache',
          'Expires' => '0'
  send_file File.join(settings.public_folder, request.path_info)
end

get '/components/*.js' do
  content_type :js
  headers 'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma' => 'no-cache',
          'Expires' => '0'
  send_file File.join(settings.public_folder, request.path_info)
end

# Serve CSS files with no caching in development
get '/*.css' do
  content_type :css
  headers 'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma' => 'no-cache',
          'Expires' => '0'
  send_file File.join(settings.public_folder, request.path_info)
end

# Serve the main HTML page
get '/' do
  headers 'Cache-Control' => 'no-store, no-cache, must-revalidate, max-age=0',
          'Pragma' => 'no-cache',
          'Expires' => '0'
  send_file File.join(settings.public_folder, 'index.html')
end

# API: Get all assets from data.md
get '/api/assets' do
  content_type :json
  
  begin
    data_file = File.read('data.md')
    assets = parse_assets(data_file)
    { success: true, assets: assets }.to_json
  rescue => e
    status 500
    { success: false, error: e.message }.to_json
  end
end

# API: Save assets back to data.md
post '/api/assets' do
  content_type :json
  
  begin
    request_payload = JSON.parse(request.body.read)
    assets = request_payload['assets']
    
    # Regenerate data.md file
    markdown_content = generate_markdown(assets)
    File.write('data.md', markdown_content)
    
    { success: true, message: 'Assets saved successfully' }.to_json
  rescue => e
    status 500
    { success: false, error: e.message }.to_json
  end
end

# Helper: Parse data.md into structured assets
def parse_assets(content)
  assets = []
  
  # Split by headers (## Title)
  sections = content.split(/^## /)
  
  # Skip the first section (file header)
  sections[1..-1].each do |section|
    lines = section.split("\n")
    title = lines[0].strip
    
    # Find JSON content between ```json and ```
    json_start = section.index('```json')
    json_end = section.index('```', json_start + 7) if json_start
    
    if json_start && json_end
      json_content = section[json_start + 7...json_end].strip
      asset_data = JSON.parse(json_content)
      
      assets << {
        title: title,
        type: asset_data['type'],
        data: asset_data['data']
      }
    end
  end
  
  assets
end

# Helper: Generate markdown from assets
def generate_markdown(assets)
  content = "# qonto - Company Profile\n"
  content += "Generated: #{Time.now.strftime('%d/%m/%Y')}\n\n"
  
  assets.each do |asset|
    content += "## #{asset['title']}\n\n"
    content += "```json\n"
    content += JSON.pretty_generate({
      type: asset['type'],
      data: asset['data']
    })
    content += "\n```\n\n---\n\n"
  end
  
  content
end

puts "Server starting on http://localhost:4567"
