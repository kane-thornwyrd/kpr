function end(stream) {
  stream.end();
}

module.exports = {
  routes: {
    post: [
      {
        path: /^\/api\/v1\/modules$/i,
        operation: end,
      },
    ],
    get: [
      {
        path: /^\/api\/v1\/modules$/i,
        operation: end
      },
      {
        path: /^\/api\/v1\/modules\/([a-z0-1_-]+)\.(tgz|zip)$/i,
        operation: end
      },
    ],
    delete: [
      {
        path: /^\/api\/v1\/modules\/([a-z0-1_-]+)\.(tgz|zip)$/i,
        operation: end
      },
    ]
  },
};
