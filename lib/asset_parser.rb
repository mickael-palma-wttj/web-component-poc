##
# AssetParser
#
# Responsible for parsing markdown content into structured asset objects.
# Extracts sections by headers and JSON blocks, with graceful error handling.
#
# Example:
#   content = File.read('data.md')
#   assets = AssetParser.new(content).call
#   # => [{title: "Company Description", type: "text", data: {...}}, ...]
#
class AssetParser
  JSON_BLOCK_PATTERN = /```json\n(.*?)\n```/m.freeze
  SECTION_SEPARATOR = /^## /.freeze

  def initialize(content)
    @content = content
  end

  ##
  # Parse the content and return array of asset objects
  # Returns only valid sections; skips sections with invalid JSON
  #
  # @return [Array<Hash>] Array of parsed assets
  #
  def call
    sections_from(@content)
      .map { |section| parse_section(section) }
      .compact
  end

  private

  ##
  # Split content by section headers (## Title)
  # Skip the first section (file header)
  #
  def sections_from(content)
    content.split(SECTION_SEPARATOR)[1..-1] || []
  end

  ##
  # Parse individual section into asset hash
  # Returns nil if JSON is invalid (graceful degradation)
  #
  def parse_section(section)
    title = extract_title(section)
    json_data = extract_json(section)

    return nil unless json_data

    {
      title: title,
      type: json_data['type'],
      data: json_data['data']
    }
  end

  ##
  # Extract title from section (first line)
  #
  def extract_title(section)
    section.split("\n").first&.strip || 'Untitled'
  end

  ##
  # Extract and parse JSON from section
  # Returns nil and logs warning on parse error
  #
  def extract_json(section)
    match = section.match(JSON_BLOCK_PATTERN)
    return nil unless match

    JSON.parse(match[1])
  rescue JSON::ParserError => e
    warn("AssetParser: Invalid JSON in section - #{e.message}")
    nil
  end
end
