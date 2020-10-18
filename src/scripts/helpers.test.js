const { formDataToObj, parsePrice } = require("./helpers");

describe('FormData helpers', () => {
  it('should return empty object if no formdata values', () => {
    const formData = new FormData();
    expect(formDataToObj(formData)).toEqual({});
  });
  it('should return empty object if no args', () => {
    expect(formDataToObj()).toEqual({});
  });
  it('should return formdata into json', () => {
    const formData = new FormData();
    formData.append('name', 'John')
    formData.append('age', 12)

    expect(formDataToObj(formData)).toEqual({ name: 'John', age: '12' })
  });
  it('should format multiple values into array', () => {
    const formData = new FormData();
    formData.append('name', 'John')
    formData.append('activities', 'Sport')
    formData.append('activities', 'Traveling')

    expect(formDataToObj(formData)).toEqual({ name: 'John', activities: ['Sport', 'Traveling'] })
  });
})

describe('parsePrice helpers', () => {
  it('should return 0 if no price given', () => {
    expect(parsePrice()).toEqual(0);
  });
  it('should return int number on price passed with $ and spaces', () => {
    expect(parsePrice('$1 000')).toEqual(1000);
  });
  it('should return int number on price passed with spaces', () => {
    expect(parsePrice('1 000')).toEqual(1000);
    expect(parsePrice('123 456 789')).toEqual(123456789);
  });
  it('should return int number on price passed without spaces', () => {
    expect(parsePrice('100')).toEqual(100);
  });
})