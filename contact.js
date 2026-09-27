const form = document.querySelector('#enquiry-form');
form.addEventListener('submit', async event => {
  event.preventDefault();
  const button = form.querySelector('[type=submit]');
  const status = document.querySelector('#form-status');
  button.disabled = true;
  status.textContent = 'Sending your enquiry…';
  try {
    const response = await fetch(form.action, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } });
    const type = response.headers.get('content-type') || '';
    if (!type.includes('application/json')) throw new Error('Email sending is not available on this preview. Please email uxdsrini@gmail.com.');
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Unable to send. Please try again.');
    status.textContent = result.message;
    form.reset();
  } catch (error) {
    status.textContent = error.message || 'Unable to connect. Please try again.';
  } finally {
    button.disabled = false;
  }
});
