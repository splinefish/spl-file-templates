var Dialog;
var ref = require('atom-space-pen-views');
var $ = ref.$;
var TextEditorView = ref.TextEditorView;
var View = ref.View;

var extend = function(child, parent) {

    var hasProp = {}.hasOwnProperty;

    for (var key in parent)
    {
        if (hasProp.call(parent, key))
        {
            child[key] = parent[key];
        }
    }

    function ctor() {

        this.constructor = child;
    }

    ctor.prototype = parent.prototype;
    child.prototype = new ctor();
    child.__super__ = parent.prototype;

    return child;
};

module.exports = Dialog = (function(superClass) {

    extend(Dialog, superClass);

    function Dialog() {

        return Dialog.__super__.constructor.apply(this, arguments);
    }

    Dialog.content = function(arg) {

        var prompt = (arg !== null ? arg : {}).prompt;
        var instance = this;

        var content = function() {

            instance.label(prompt, {class: 'icon', outlet: 'promptText'});
            instance.subview('miniEditor', new TextEditorView({mini: true}));

            return instance.div({
                class: 'error-message',
                outlet: 'errorMessage'
            });
        };

        return this.div({class: 'tree-view-dialog'}, content);
    };

    Dialog.prototype.initialize = function(arg) {

        var ref1 = arg !== null ? arg : {};
        var select = ref1.select;
        var iconClass = ref1.iconClass;
        var instance = this;

        if (iconClass)
        {
            this.promptText.addClass(iconClass);
        }

        atom.commands.add(this.element, {

            'core:confirm': function() {
                return instance.onConfirm(instance.miniEditor.getText());
            },

            'core:cancel': function() {
                return instance.cancel();
            }
        });

        this.miniEditor.on('blur', function() {

            if (document.hasFocus())
            {
                return instance.close();
            }
        });

        this.miniEditor.getModel().onDidChange(function() {
            return instance.showError();
        });

        return this.miniEditor.getModel().setText('');
    };

    Dialog.prototype.attach = function() {

        this.panel = atom.workspace.addModalPanel({item: this.element});
        this.miniEditor.focus();

        return this.miniEditor.getModel().scrollToCursorPosition();
    };

    Dialog.prototype.close = function() {

        var panelToDestroy = this.panel;
        this.panel = null;

        if (panelToDestroy !== null)
        {
            panelToDestroy.destroy();
        }

        return atom.workspace.getActivePane().activate();
    };

    Dialog.prototype.cancel = function() {

        this.close();

        return $('.tree-view').focus();
    };

    Dialog.prototype.showError = function(message) {

        if (message === null)
        {
            message = '';
        }

        this.errorMessage.text(message);

        if (message)
        {
            return this.flashError();
        }
    };

    return Dialog;
})(View);
