/**
 * validMary() reads document.getElementById('mary'|'mariageDate'|'divorceDate').value
 * directly. Inserted via a separate wrapper (not document.body.innerHTML +=)
 * so the existing fixture element (and its __vue__ reference) is never
 * destroyed/re-parsed.
 */
function insertMaryInputs({ mary = '', mariageDate = '', divorceDate = '' } = {}) {
  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <input id="mary" value="${mary}">
    <input id="mariageDate" value="${mariageDate}">
    <input id="divorceDate" value="${divorceDate}">
  `;
  document.body.appendChild(wrapper);
}

module.exports = { insertMaryInputs };
