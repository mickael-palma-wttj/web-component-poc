# frozen_string_literal: true

##
# Bundles component JavaScript files into a single response
# Single Responsibility: Component bundling logic
#
class ComponentBundler
  def initialize(public_folder:, registry: AppConfig.component_registry)
    @public_folder = public_folder
    @registry = registry
  end

  def bundle(types:, include_base: true)
    files = collect_files(types, include_base)
    build_bundle(files, types)
  end

  def registry_for(types = nil)
    return @registry if types.nil? || types.empty?

    @registry.slice(*types)
  end

  private

  def collect_files(types, include_base)
    files = []
    files.concat(base_dependency_files) if include_base
    files.concat(component_files_for(types))
    files
  end

  def base_dependency_files
    base_deps = %w[style-constants.js form-helper.js template-builder.js base-component.js]
    files = base_deps.map { |f| file_info(File.join('components', f)) }.compact

    spinner_path = File.join(@public_folder, 'utils', 'spinner-styles.js')
    files << { file: 'utils/spinner-styles.js', path: spinner_path } if File.exist?(spinner_path)

    files
  end

  def component_files_for(types)
    types.filter_map do |type|
      next unless @registry.key?(type)

      file_info(File.join('components', @registry[type][:file]), type: type)
    end
  end

  def file_info(relative_path, type: nil)
    full_path = File.join(@public_folder, relative_path)
    return nil unless File.exist?(full_path)

    { file: File.basename(relative_path), path: full_path, type: type }
  end

  def build_bundle(files, types)
    lines = bundle_header(types, files.length)

    files.each do |file_info|
      lines.concat(file_section(file_info))
    end

    lines.join("\n")
  end

  def bundle_header(types, file_count)
    [
      "// Component Bundle - Generated at #{Time.now.utc.iso8601}",
      "// Types: #{types.join(', ')}",
      "// Files: #{file_count}",
      ''
    ]
  end

  def file_section(file_info)
    content = File.read(file_info[:path])
    content = strip_imports(content)

    [
      '// ==============================================',
      "// File: #{file_info[:file]}",
      '// ==============================================',
      content,
      ''
    ]
  end

  ##
  # Strips ES6 import statements from bundled content
  # Note: Uses simple regex matching - works for standard single-line imports
  # but may not handle all edge cases (multi-line imports, dynamic imports)
  #
  def strip_imports(content)
    content
      .gsub(%r{^import\s+.*?['"]\./[^'"]+['"];?\s*$}, '// [bundled] \0')
      .gsub(%r{^import\s+.*?['"]\.\./utils/[^'"]+['"];?\s*$}, '// [bundled] \0')
  end
end
