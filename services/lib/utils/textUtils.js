class TextUtils {

  /**
   * @description Convert snake or kebab case to camel case
   * @param {String} str
   * @returns {String}
   */
  toCamelCase(str='') {
    str = String(str);
    return str.replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase()
      .replace('-', '')
      .replace('_', '')
    );
  }

  /**
   * @description Convert camel case to snake case
   * @param {String} str
   * @returns {String}
   */
  camelToSnakeCase(str='') {
    str = String(str);
    str = str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    return str;
  }
}

export default new TextUtils();
