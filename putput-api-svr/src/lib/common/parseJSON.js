exports.parseJSON = (str) => {
  let parsed = null;
  try {
    parsed = JSON.parse(str);
  } catch (e) {
    return null;
  }
  return parsed;
};

exports.jsonKeyNameChange = (json) => {
  try {
    json = JSON.parse(JSON.stringify(json));
  } catch (e) {
    return null;
  }
  return json;
};