const { formDataToObj } = require("./helpers");

describe('FormData helpers', () => {
  it('should return null if no formdata values', () => {
    const formData = new FormData();
    expect(formDataToObj(formData)).toEqual({});
  });
  it('should return formdata into json', () => {
    const formData = new FormData();
    formData.append('name', 'John')
    formData.append('age', 12)

    expect(formDataToObj(formData)).toEqual({ name: 'John', age: '12' })
  });
})
