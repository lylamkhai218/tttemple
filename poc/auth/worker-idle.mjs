// Safe deployed state after a scheduled experiment.
export default {
  async fetch() { return new Response('Not found', { status: 404 }); },
  async scheduled() {},
};
