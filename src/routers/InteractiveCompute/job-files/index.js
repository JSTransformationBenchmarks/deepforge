(async function () {
  const fs_readFilePromise = require('util').promisify(require('fs').readFile);

  /* globals requireJS */
  const Files = requireJS('deepforge/plugin/GeneratedFiles');
  const Templates = requireJS('plugin/GenerateJob/GenerateJob/templates/index');

  const fs = require('fs');

  const path = require('path');

  const START_SESSION = await fs_readFilePromise(path.join(__dirname, 'start.js'), 'utf8');
  const srcDir = path.join(__dirname, '..', '..', '..');
  const interactiveDir = path.join(srcDir, 'common', 'compute', 'interactive');
  const MESSAGE = await fs_readFilePromise(path.join(interactiveDir, 'message.js'), 'utf8');

  const _ = requireJS('underscore');

  const CONSTANTS = requireJS('deepforge/Constants');

  class StartSessionFiles extends Files {
    constructor(blobClient, url, id) {
      super(blobClient);
      this.id = id;
      this.createFiles(url, id);
    }

    createFiles(url, id) {
      const config = JSON.stringify({
        cmd: 'node',
        args: ['start.js', url, id],
        outputInterval: -1,
        resultArtifacts: []
      }, null, 2);
      this.addFile('executor_config.json', config);
      this.addFile('start.js', START_SESSION);
      this.addFile('message.js', MESSAGE);
      this.addFile('utils.build.js', Templates.UTILS);
      this.addFile('deepforge/__init__.py', Templates.DEEPFORGE_INIT);

      const serializeTpl = _.template(Templates.DEEPFORGE_SERIALIZATION);

      this.addFile('deepforge/serialization.py', serializeTpl(CONSTANTS));
    }

    async upload() {
      const name = `interactive-session-init-${this.id}`;
      return await this.save(name);
    }

  }

  module.exports = StartSessionFiles;
})();