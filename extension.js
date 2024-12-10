const hx = require("hbuilderx");
const showView = require('./src/main.js');

function activate(context) {
	   

    let disposable = hx.commands.registerCommand('extension.publishApp', (param) => {
        if (param == null) {
            param = {};
        };
        showView(param);
    });
    context.subscriptions.push(disposable);
};

function deactivate() {

};

module.exports = {
    activate,
    deactivate
}
