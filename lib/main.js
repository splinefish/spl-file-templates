var Main;
var path = require('path');
var fs = require('fs-plus');
var Atom = require('atom');
var MainView = require('./main-view');
var CompositeDisposable = Atom.CompositeDisposable;
var BufferedProcess = Atom.BufferedProcess;

// atom.workspace.open(filename)

module.exports = Main = {

    mainView: null,
    modalPanel: null,
    subscriptions: null,
    packagename: 'spl-file-templates',
    config: {
        templateDirectory: {
            type: 'string',
            default: path.join(__dirname, '../templates')
        },
        authorName: {
            type: 'string',
            default: '<Change this in the package settings.>'
        },
        authorEmail: {
            type: 'string',
            default: '<Change this in the package settings.>'
        },
        company: {
            type: 'string',
            default: '<Change this in the package settings.>'
        },
        package: {
            type: 'string',
            default: '<Change this in the package settings.>'
        }
    },

    activate: function(state) {

        // Activates and restores the previous session of your package.

        var viewstate = state.mainState;
        var templateArray = this.generateTemplateArray();
        var commandBindings = {};
        var instance = this;

        this.mainView = new MainView(viewstate);
        this.subscriptions = new CompositeDisposable();

        this.modalPanel = atom.workspace.addModalPanel({

          item: this.mainView.getElement(),
          visible: false
        });

        this.createContextMenu(templateArray);

        for (var i = 0; i < templateArray.length; ++i)
        {
            commandBindings[templateArray[i].commandName] = (function(template) {

                return function(event) {

                    var directoryPath = event.target.dataset.path;

                    if (fs.isFileSync(directoryPath))
                    {
                        directoryPath = path.dirname(directoryPath);
                    }

                    instance.showNamingDialog(function(name) {

                        instance.createFile(directoryPath, name, template);
                    });
                };
            })(templateArray[i]);
        }

        commandBindings['advanced-create-file:view-template-folder'] =
            function(event) {

                return instance.viewTemplateFolder();
            };

        var commands = atom.commands.add(
            '.tree-view .directory .name',
            commandBindings
        );

        this.subscriptions.add(commands);
    },

    deactivate: function() {

        // When the user or Atom itself kills a window, this method is called.

        this.modalPanel.destroy();
        this.subscriptions.dispose();

        return this.mainView.destroy();
    },

    serialize: function() {

        // To save the current package's state, this method should return an
        // object containing all required data.

        return {

          mainState: this.mainView.serialize()
        };
    },

    getJsonFromFile: function(filename) {

        var content = fs.readFileSync(filename, 'utf8');
        var data = JSON.parse(content);

        return data;
    },

    generateTemplateArray: function() {

        var files = fs.listSync(this.getTemplateDirectory(), ['json']);
        var templates = [];
        var metadata, identifier;

        for (var i = 0; i < files.length; ++i)
        {
            metadata = this.getJsonFromFile(files[i]);
            identifier = path.basename(files[i]).replace('.', '');

            if (metadata)
            {
                templates.push({

                    filename: files[i],
                    metadata: metadata,
                    commandName: this.packagename + ':create-' + identifier
                });
            }
        }

        return templates;
    },

    createContextMenu: function(templateArray) {

        var availableTemplates = [];

        for (var i = 0; i < templateArray.length; ++i)
        {
            availableTemplates.push({
                label: templateArray[i].metadata.templateName,
                command: templateArray[i].commandName
            });
        }

        availableTemplates.push({
            type: 'separator'
        });

        availableTemplates.push({
            label: 'View template directory',
            command: 'advanced-create-file:view-template-folder'
        });

        atom.contextMenu.add({'.tree-view.full-menu .directory': [{
            label: 'Create file from template',
            submenu: availableTemplates
        }]});
    },

    showNamingDialog: function(callback) {

        var NameDialog = require('./name-dialog');
        var dialog = new NameDialog('', true);

        dialog.on('file-created', function(event, name) {

            dialog.close();

            if (callback)
            {
                callback(name);
            }
        });

        dialog.attach();
    },

    getProjectRootPath: function(targetFile) {

        var path = atom.project.relativizePath(targetFile);
        var result = null;

        if (path)
        {
            result = path[0];
        }

        return result;
    },

    fileExists: function(filename) {

        var exists = true;

        try
        {
            var stats = fs.statSync(filename);
        }
        catch (e)
        {
            exists = false;
        }

        return exists;
    },

    writeTemplateFile: function(sourceFile, destinationFile, name) {

        var content = fs.readFileSync(sourceFile, 'utf8');
        var isoTimestamp = new Date().toISOString();
        var timestampSplit = isoTimestamp.split('T');
        var projectRoot = this.getProjectRootPath(destinationFile);
        var projectFile = path.join(projectRoot, '/', '.spl-file-templates');
        var variables = {
            name: name,
            date: timestampSplit[0],
            time: timestampSplit[1].replace(/\..+/, ''),
            authorname: atom.config.get('spl-file-templates.authorName'),
            authoremail: atom.config.get('spl-file-templates.authorEmail'),
            company: atom.config.get('spl-file-templates.company'),
            package: atom.config.get('spl-file-templates.package')
        };

        if (projectRoot && this.fileExists(projectFile))
        {
            var projectJson = this.getJsonFromFile(projectFile);

            Object.keys(projectJson).forEach(function(key) {

                variables[key] = projectJson[key];
            });
        }

        Object.keys(variables).forEach(function(key) {
            content = content.replace(new RegExp('{' + key.toUpperCase() + '}', 'g'), variables[key]);
        });

        fs.writeFileSync(destinationFile, content, 'utf8');
    },

    getTemplateDirectory: function() {

        return atom.config.get('spl-file-templates.templateDirectory');
    },

    createFile: function(outputDirectory, name, template) {

        var outputFile, filename;
        var templateDirectory = this.getTemplateDirectory();

        for (var i = 0; i < template.metadata.files.length; ++i)
        {
            filename = '';

            if (template.metadata.files[i].prefix)
            {
                filename += template.metadata.files[i].prefix + '.';
            }

            filename += name;

            if (template.metadata.files[i].extension)
            {
                filename += '.' + template.metadata.files[i].extension;
            }

            outputFile = path.join(outputDirectory, filename);

            this.writeTemplateFile(
                path.join(templateDirectory, template.metadata.files[i].template),
                outputFile,
                name
            );
        }
    },

    fileManagerCommandForPath: function(directory) {

        var output = {};

        switch (process.platform)
        {
            case 'darwin':
            {
                output = {
                    command: 'open',
                    label: 'Finder',
                    args: ['-R', directory]
                };

                break;
            }
            case 'win32':
            {
                output = {
                    args: [directory],
                    label: 'Explorer'
                };

                if (process.env.SystemRoot)
                {
                    output.command = path.join(process.env.SystemRoot, 'explorer.exe');
                }
                else
                {
                    output.command = 'explorer.exe';
                }

                break;
            }
            default:
            {
                output = {
                    command: 'xdg-open',
                    label: 'File Manager',
                    args: [directory]
                };

                break;
            }
        }

        return output;
    },

    viewTemplateFolder: function() {

        var templateDirectory = this.getTemplateDirectory();
        var ref = this.fileManagerCommandForPath(templateDirectory);
        var errorLines = [];

        var stderr = function(lines) {
            return errorLines.push(lines);
        };

        var handleError = function(errorMessage) {

            return atom.notifications.addError(
                'Opening ' + templateDirectory + ' failed', {
                    detail: errorMessage,
                    dismissable: true
            });
        };

        var exit = function(code) {

            var failed = code !== 0;
            var errorMessage = errorLines.join('\n');

            if (process.platform === 'win32' && code === 1 && !errorMessage)
            {
                failed = false;
            }

            if (failed)
            {
                return handleError(errorMessage);
            }
        };

        var showProcess = new BufferedProcess({
            command: ref.command,
            args: ref.args,
            stderr: stderr,
            exit: exit
        });

        return showProcess.onWillThrowError(function(arg) {

            var error = arg.error;
            var handle = arg.handle;

            handle();

            return handleError(error !== null ? error.message : void(0));
        });
    }
};
