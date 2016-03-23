var MainView;

module.exports = MainView = (function() {

    function MainView(serializedState) {

        var message;
        this.element = document.createElement('div');
        this.element.classList.add('spl-file-templates');
        message = document.createElement('div');
        message.textContent = "spl-file-templates";
        message.classList.add('message');
        this.element.appendChild(message);
    }

    MainView.prototype.serialize = function() {};

    MainView.prototype.destroy = function() {

        return this.element.remove();
    };

    MainView.prototype.getElement = function() {

        return this.element;
    };

    return MainView;
})();
