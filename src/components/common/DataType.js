const FIELD_TYPES = {
  TYPE_INTEGER: "civFieldTypeInteger",
  TYPE_SMALL_INTEGER: "civFieldTypeSmallInteger",
  TYPE_LONG: "civFieldTypeLong",
  TYPE_DOUBLE: "civFieldTypeDouble",
  TYPE_STRING: "civFieldTypeString",
  TYPE_DATE: "civFieldTypeDate",
  TYPE_GEOMETRY: "civFieldTypeGeometry",
  TYPE_OID: "civFieldTypeOID",
  TYPE_BLOB: "civFieldTypeBlob",
  TYPE_GLOBAL_ID: "civFieldTypeGlobalID",
  TYPE_RASTER: "civFieldTypeRaster",
  TYPE_GUID: "civFieldTypeGUID",
  TYPE_XML: "civFieldTypeXML"
};

const LOGIC_OPERS = [{
  label: "或",
  value: "or",
  mvalue: "or"
}, {
  label: "且",
  value: "and",
  mvalue: "all"
}];

const NUMBER_OPERS = [{
  label: "大于",
  value: ">"
}, {
  label: "小于",
  value: "<"
}, {
  label: "等于",
  value: "="
}, {
  label: "大于等于",
  value: ">="
}, {
  label: "小于等于",
  value: "<="
}, {
  label: "不等于",
  value: "<>"
}];

const DATE_OPERS = [{
  label: "大于",
  value: ">"
}, {
  label: "小于",
  value: "<"
}, {
  label: "等于",
  value: "="
}, {
  label: "大于等于",
  value: ">="
}, {
  label: "小于等于",
  value: "<="
}, {
  label: "不等于",
  value: "<>"
}, {
  label: "包含",
  value: "like"
}, {
  label: "为空",
  value: "is null"
}, {
  label: "非空",
  value: "is not null"
}];

const STRING_OPERS = [{
  label: "等于",
  value: "="
}, {
  label: "不等于",
  value: "<>"
}, {
  label: "包含",
  value: "like"
}, {
  label: "为空",
  value: "is null"
}, {
  label: "非空",
  value: "is not null"
}];

const getOperators = (data) => {
  if (!data) {
    return [];
  }
  var ops;
  switch (data) {
    case FIELD_TYPES.TYPE_DOUBLE:
    case FIELD_TYPES.TYPE_LONG:
    case FIELD_TYPES.TYPE_INTEGER:
    case FIELD_TYPES.TYPE_OID:
    case FIELD_TYPES.TYPE_SMALL_INTEGER: {
      ops = NUMBER_OPERS;
      break;
    }
    case FIELD_TYPES.TYPE_DATE: {
      ops = DATE_OPERS;
      break;
    }
    case FIELD_TYPES.TYPE_STRING: {
      ops = STRING_OPERS;
      break;
    }
    default: {
      ops = [];
      break;
    }

  }
  return ops;
};

const isNumberField = (type) => {
  return [FIELD_TYPES.TYPE_DOUBLE, FIELD_TYPES.TYPE_INTEGER, FIELD_TYPES.TYPE_OID, FIELD_TYPES.TYPE_SMALL_INTEGER].includes(type);
};

const isStringField = (type) => {
  return FIELD_TYPES.TYPE_STRING === type;
};

const isDateField = (type) => {
  return FIELD_TYPES.TYPE_DATE === type;
};

export {
  FIELD_TYPES,
  LOGIC_OPERS,
  NUMBER_OPERS,
  DATE_OPERS,
  STRING_OPERS,
  getOperators,
  isNumberField,
  isStringField,
  isDateField
};
