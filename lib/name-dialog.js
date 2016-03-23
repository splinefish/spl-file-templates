var NameDialog;
var Dialog = require('./dialog');

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

module.exports = NameDialog = (function(superClass) {

    extend(NameDialog, superClass);

    function NameDialog() {

        NameDialog.__super__.constructor.call(this, {

            prompt: "Enter the name for the template.",
            select: false,
            iconClass: 'icon-file-add'
        });
    }

    NameDialog.prototype.onConfirm = function(newPath) {

        this.trigger('file-created', [newPath]);
    };

    return NameDialog;
})(Dialog);
