
export const copyToClipboard = (textToCopy, container) => {
  console.log(container);
  const textField = document.createElement('textarea');
  textField.value = textToCopy;
  const cont = container || document.body;
  cont.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  cont.removeChild(textField);
};
