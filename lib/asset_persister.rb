# frozen_string_literal: true

##
# Saves assets back to markdown file
# Single Responsibility: Asset persistence logic
#
class AssetPersister
  def initialize(data_path = AppConfig.data_file_path)
    @data_path = data_path
  end

  def save(assets)
    markdown_content = MarkdownGenerator.new(assets).call
    File.write(@data_path, markdown_content)
  end
end
