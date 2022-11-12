### Target Schema
```
sourceSchema {
  adapter
  isFlat
}

fieldStructure {
  path  // structure: where this data is saved on disk (was storage)
  jsonType // structure: the json type of the field
  usage // structure?: allow the different layers to add functionality
}

fieldAlias {
  name: // name of the structure
  path: // the field path we're mapping to
}

fieldModelMethods {
  onInflate?
  onDeflate?
}

fieldUsage extends fieldStructure {
  description? // 
  tags[]? // 
}

fieldModelInfo {
  source: // 
  external:
  internal:
  config
  methods: fieldModelMethods
}

fieldServiceMethods extends fieldModelMethods {
  onCreate?
  onRead?
  onUpdate?
  onDelete?
}

fieldServiceInfo extends fieldModelInfo {
  methods: fieldServiceMethods
}

fieldServiceInterface extends fieldServiceInfo {
  structure: fieldUsage || fieldAlias
}
```