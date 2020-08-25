export function handleGoBack() {
  history.back();
}

export function getURLParams() {
  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);
  return urlParams;
}

export function formDataToObj(formData = {}) {
  let object = {};
  formData.forEach((value, key) => {
    object[key] = value;
  });

  return object;
}

export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
