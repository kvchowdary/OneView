AGS.Model.Service = function (options) {
    var defaultSettings = {
        eventHandlers: {
            onServerRequestError: function () { },
            onLogin: null,
            onLoginError: null,
            onTrainedRespondersReceived: null,
            onAEDsReceived: null,
            onAMListReceived: null,
            onAEDStatusUpdated: null,
            onNotificationsReceived: null,
            onMessagesReceived: null,
            onMaintSaved: null
        }
    };

    this.settings = $.extend(defaultSettings, options);
    AGS.Model.Common.registerErrorCallBack(this.settings.eventHandlers.onServerRequestError);
};

AGS.Model.Service.prototype = {
    signIn: function (userName, password) {
        var _this = this;
        this.ApiCreate("login", function (response) {
            if (_this.settings.eventHandlers.onLogin) {
                var data = {};
                data.username = userName;
                data.password = password;
                data.ticket = response.data.ticket;
                _this.setToken(data);
                _this.settings.eventHandlers.onLogin(data);
            }
        }, function (data, error) {
            if (_this.settings.eventHandlers.onLoginError)
                _this.settings.eventHandlers.onLoginError(data, error);
        }, null, { "username" : userName , "password" : password });
    },
    getCustomerData: function () {
        return localStorage.getItem("customerData");
    },
    setToken: function (data) {
        localStorage.setItem("customerData", JSON.stringify(data));
    },
    signOut: function () {
       localStorage.removeItem("customerData");
    },
    getActiveAEDs: function (customerId) {
        var _this = this;
        this.ApiRead("AED/List?customerId=" + customerId, function (data) {
            if (_this.settings.eventHandlers.onAEDsReceived) _this.settings.eventHandlers.onAEDsReceived(data);
        }, null, null, null);
    },
    getActiveTrainedResponders: function (customerId) {
        var _this = this;
        this.ApiRead("TrainedResponder/List?customerId=" + customerId, function (data) {
            if (_this.settings.eventHandlers.onTrainedRespondersReceived) _this.settings.eventHandlers.onTrainedRespondersReceived(data);
        }, null, null, null);

    },
    getAMList: function (customerId) {
        var _this = this;
        this.ApiRead("Maintenance/List/" + customerId, function (data) {
            if (_this.settings.eventHandlers.onAMListReceived) _this.settings.eventHandlers.onAMListReceived(data);
        }, null, null, null);

    },
    getMessages: function (customerId, pageToDisplay) {
        var _this = this;
        this.ApiRead("Account/Messages/" + customerId, function (data) {
            if (_this.settings.eventHandlers.onMessagesReceived) _this.settings.eventHandlers.onMessagesReceived(data, pageToDisplay);
        }, null, null, null);
    },
    sendFeedback: function (user, message) {
        var _this = this;
        var requestData = {
            "user": user,
            "message": message
        };
        this.ApiCreate("Account/Feedback", function () {
            if (_this.settings.eventHandlers.onFeedbackSaved) _this.settings.eventHandlers.onFeedbackSaved();
        }, null, null, requestData);
    },
    saveMaintanence: function (maintenanceStatus) {
        var _this = this;
        this.ApiCreate("Maintenance/Edit", function (data) {
            if (_this.settings.eventHandlers.onMaintSaved) _this.settings.eventHandlers.onMaintSaved(data);
        }, null, null, { requestBody: maintenanceStatus });
    }
};
var base = new AGS.Model.Common();
AGS.Model.Service.prototype = $.extend({}, AGS.Model.Service.prototype, base);
AGS.Model.Service.prototype.base = base;