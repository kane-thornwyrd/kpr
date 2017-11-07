
const uploadModule = async (req, res) => {
  res.send('uploadModule');
}

const listModules = async (req, res) => {
  res.send('listModules');
}

const downloadModules = async (req, res) => {
  res.send('downloadModules');
}

const deleteModules = async (req, res) => {
  res.send('deleteModules');
}

module.exports = {
  routes: {
    post: [
      {
        path: /^\/api\/v1\/modules$/i,
        operation: uploadModule,
      },
    ],
    get: [
      {
        path: /^\/api\/v1\/modules$/i,
        operation: listModules
      },
      {
        path: /^\/api\/v1\/modules\/([a-z0-1_-]+)\.(tgz|zip)$/i,
        operation: downloadModules
      },
    ],
    delete: [
      {
        path: /^\/api\/v1\/modules\/([a-z0-1_-]+)\.(tgz|zip)$/i,
        operation: deleteModules
      },
    ]
  },
};
