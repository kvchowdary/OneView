AGS.Presenters.MainPage = function (options) {
    var defaults = {
        eventHandlers: {}
    };
    this.settings = $.extend(defaults, options);
    this.Model = null;
    this.Views = {};
};
AGS.Presenters.MainPage.prototype = {
    /*** init *********************************************************/
    init: function () {
        this.initPage();
        this.initModel();
        this.initViews();
        this.afterInit();
    },
    checkEmail: function (inputvalue) {
        var pattern = /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/gi;
        var num_pattern = /^\d+$/gi;
        if (pattern.test(inputvalue)) { return true; }
        else if (num_pattern.test(inputvalue)) { return true; }
        else {
            alert("Please enter valid email address", null, "Login failed", "OK");
            return false;
        }
    },
    initPage: function () {
        var _this = this;
        $("#btnLogin").click(function () {
            var username = $("#txtUserName").val();
            var password = $("#txtPassword").val();
            var loginUserPhoneUDID = $('#hiddenLoginUserPhoneUDID').val();
            var loginUserPhoneVersion = $('#hiddenLoginUserPhoneVersion').val();
            var loginUserPhoneDeviceName = $('#hiddenLoginUserPhoneDeviceName').val();
            if (_this.validate(username, password)) {
                $.mobile.loading('show', {
                    text: 'Signing In',
                    textVisible: true,
                    theme: 'a',
                    html: ""
                });
                _this.Model.signIn(username, password, loginUserPhoneUDID, loginUserPhoneVersion, loginUserPhoneDeviceName);
            }
        });
        //Tab and Home page events
        /*************************************** Event Handling on Popup Menu *************************/
        $(".lnkHomeIcon").click(function () {
            var customerData = JSON.parse(localStorage.getItem("customerData"));
            if (customerData != null) {
                _this.setHomePageData(customerData);
            }
        });
        $(".btnMessageCenter").click(function () {
            _this.onMessageCenterClicked();
        });
        $(".btnTrainedResponders").click(function () {
            _this.onTrainedRespondersClicked();
        });
        $(".btnAEDs").click(function () {
            _this.onAEDsClicked();
        });
        $(".btnMaintenance").click(function () {
            _this.onMaintenanceClicked();
        });
        $(".btnFeedback").click(function () {
            _this.onFeedbackMenuClicked();
        });
        $(".btnLogout").click(function () {
            _this.onLogoutClicked();
        });
        $(".btnHelp").click(function () {
            _this.onHelpClicked();
        });
        $(".btnAccept").click(function () {
            if (!$('#chkAccepted').is(":checked")) {
                alert("Please accept terms & conditions to proceed");
                return false;
            }
            _this.onTermConditionClicked();
        });
    },
    validate: function (username, password) {
        if (username.length <= 0 || password <= 0) {
            alert("Username or password cannot be empty.", null, "Login failed", "OK");
            return false;
        }
       // if (!this.checkEmail(username)) return false;
        return true;
    },
    initViews: function () {
        var _this = this;
        this.Views.MessageCenter = new AGS.Views.MessageCenter({
            containerSelector: "#divMsgCentercontainer",
            eventHandlers: {
                rendered: function () {
                    _this.onMCPageRendered();
                }
            }
        });
        this.Views.AEDList = new AGS.Views.AEDList({
            containerSelector: "#divAEDListingContainer",
            eventHandlers: {
                rendered: function () {
                    _this.onAEDsPageRendered();
                }
            }
        });
        this.Views.TRList = new AGS.Views.TRList({
            containerSelector: "#divTRListContainer",
            eventHandlers: {
                rendered: function () {
                    _this.onTRPageRendered();
                }
            }
        });
        this.Views.AEDMaintenance = new AGS.Views.AEDMaintenance({
            containerSelector: "#divAEDMaintenanceContainer",
            eventHandlers: {
                rendered: function () {
                    _this.onAMPageRendered();
                },
                onMaintSaveClicked: function (msg) {
                    _this.onMaintSaveClicked(msg);
                }
            }
        });
        this.Views.Feedback = new AGS.Views.Feedback({
            containerSelector: "#divFeedbackContainer",
            eventHandlers: {
                rendered: function () {
                    _this.onFeedbackPageRendered();
                },
                onSendClicked: function (msg) {
                    _this.onSendClicked(msg);
                }
            }
        });
        this.Views.Help = new AGS.Views.Help({
            containerSelector: "#divHelpContainer",
            eventHandlers: {
                rendered: function () {
                    _this.onHelpPageRendered();
                }
            }
        });
    },
    initModel: function () {
        var _this = this;
        var eventHandlers = {};
        eventHandlers.onServerRequestError = function (data, errors) { _this.onServerRequestError(data, errors); };
        this.addModelEventHandlers(eventHandlers);
        this.Model = new AGS.Model.Service({ "eventHandlers": eventHandlers });
    },
    addModelEventHandlers: function (eventHandlers) {
        var _this = this;
        eventHandlers.onLogin = function (data) { _this.onLogin(data); };
        eventHandlers.onLoginError = function (error) { _this.onLoginError(error); };
        eventHandlers.onTrainedRespondersReceived = function (data) { _this.onTrainedRespondersReceived(data); };
        eventHandlers.onAEDsReceived = function (data) { _this.onAEDsReceived(data); };
        eventHandlers.onAMListReceived = function (data) { _this.onAMListReceived(data); };
        eventHandlers.onMessagesReceived = function (data, pageToDisplay) { _this.onMessagesReceived(data, pageToDisplay); };
        eventHandlers.onMaintSaved = function (data) { _this.onMaintSaved(data); };
        eventHandlers.onFeedbackSaved = function () { _this.onFeedbackSaved(); };
        eventHandlers.onTermsConditionsReceived = function (data) { _this.onTermsConditionDataReceived(data); };
        eventHandlers.onTermsSaved = function (data) { _this.onTermsSaved(data); };
    },
    afterInit: function () {
        var username = localStorage.getItem("username");
        var password = localStorage.getItem("password");
        if (username != null && password != null) {
            var customerData = JSON.parse(localStorage.getItem("customerData"));
            if (customerData != null) {
                customerData.HasAcceptedTncMobile == false ? this.setTermAndConditionsData(customerData) : this.setHomePageData(customerData)
            }
        }
    },
    onLogin: function (data) {
        localStorage.setItem("customerData", JSON.stringify(data));
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        if (customerData != null) {
            customerData.HasAcceptedTncMobile == false ? this.setTermAndConditionsData(customerData) : this.setHomePageData(customerData)
        }
    },
    setTermAndConditionsData: function (customerData) {
        $.mobile.changePage("#pgTermsCondition");
        $("#pgTermsCondition").trigger('create');
    },
    setHomePageData: function (customerData) {
        var name = "";
        if (customerData.FirstName != null && typeof (customerData.FirstName) != "undefined")
            name = customerData.FirstName;
        if (customerData.LastName != null && typeof (customerData.LastName) != "undefined")
            name = name + " " + customerData.LastName;
        $('.welcomeTxt').find('label').text(name);
        $('.customerTitle').text(customerData.UserCustomer.Name);
        $.mobile.changePage("#pgHome");
    },
    onLogoutClicked: function () {
        $("#txtUserName").val("");
        $("#txtPassword").val("");
        this.Model.signOut();
        $.mobile.changePage("#pgLogin");
    },
    onLoginError: function (error) {
        $.mobile.loading('hide');
        if (error.Message == null || error.Message == undefined) {
            alert("Unexpected error.Please try again!", null, "Login failed", "OK");
        } else {
            alert(error.Message, null, "Login failed", "OK");
        }
    },
    onHomePageRendered: function () {
        $.mobile.changePage("#pgHome");
        $.mobile.loading('hide');
    },
    onMessageCenterClicked: function () {
        $.mobile.loading('show', {
            text: 'Loading',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        this.getMessages("msgcenter");
    },
    getMessages: function (pageToDisplay) {
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        this.Model.getMessages(customerData.UserCustomer.Id, pageToDisplay);
    },
    onTrainedRespondersClicked: function () {
        $.mobile.loading('show', {
            text: 'Loading Trained Responders',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        this.Model.getActiveTrainedResponders(customerData.UserCustomer.Id);
    },
    onAEDsClicked: function () {
        $.mobile.loading('show', {
            text: 'Loading AEDs',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        this.Model.getActiveAEDs(customerData.UserCustomer.Id);
    },
    onMaintenanceClicked: function () {
        $.mobile.loading('show', {
            text: 'Loading Maintenance..',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        this.Model.getAMList(customerData.UserCustomer.Id);
    },
    onFeedbackMenuClicked: function () {
        this.Views.Feedback.setData();
    },
    onTermConditionClicked: function () {
        $.mobile.loading('show', {
            text: 'Saving Terms and Conditions.',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        this.Model.acceptedTermsConditions(customerData);
    },
    onHelpClicked: function () {
        $.mobile.loading('show', {
            text: 'Loading Help',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        this.getMessages("help");
    },
    onMCPageRendered: function (data) {
        $.mobile.changePage("#pgMessageCenter");
        $.mobile.loading('hide');
    },
    onTrainedRespondersReceived: function (data) {
        this.Views.TRList.setData(data);
    },
    onAMListReceived: function (data) {
        this.Views.AEDMaintenance.setData(data);
    },
    onTermsConditionDataReceived: function (data) {
        this.Views.termsCondition.setData(data);
    },
    onTRPageRendered: function () {
        $.mobile.changePage("#pgTR");
        $.mobile.loading('hide');
        $("#pgTR").trigger('create');
    },
    onAMPageRendered: function () {
        $.mobile.changePage("#pgAM");
        $.mobile.loading('hide');
        $("#pgAM").trigger('create');
    },
    onFeedbackPageRendered: function () {
        $.mobile.changePage("#pgFeedback");
        $("#pgFeedback").trigger('create');
    },
    onHelpPageRendered: function () {
        $.mobile.loading('hide');
        $.mobile.changePage("#pgHelp");
        $("#pgHelp").trigger('create');
    },
    onTermsConditionRendered: function () {
        $.mobile.loading('hide');
        $.mobile.changePage("#pgTermsCondition");
        $("#pgTermsCondition").trigger('create');
    },
    onAEDsReceived: function (data) {
        this.Views.AEDList.setData(data);
    },
    onMaintSaved: function (data) {
        alert("Device maintenance completed successfully", null, "AED Maintenance", "OK");
        $.mobile.loading('hide');
        //TODO: Update from Javascript
        $.mobile.loading('show', {
            text: 'Loading Maintenance..',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        this.Model.getAMList(customerData.UserCustomer.Id);
    },
    onTermsSaved: function (data) {
        $.mobile.loading('hide');
        $.mobile.loading('show', {
            text: 'Loading Home Page..',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        var customerData = JSON.parse(localStorage.getItem("customerData"));
        this.setHomePageData(customerData);
    },
    onFeedbackSaved: function () {
        $.mobile.loading('hide');
        alert("Feedback submitted", null, "Feedback", "OK");
        this.Views.Feedback.reset();
    },
    onMessagesReceived: function (data, pageToDisplay) {
        if (pageToDisplay == "msgcenter") {
            this.Views.MessageCenter.setData(data);
        }
        if (pageToDisplay == "help") {
            this.Views.Help.setData(data);
        }
    },
    onAEDsPageRendered: function () {
        $.mobile.loading('hide');
        $.mobile.changePage($("#pgAED"));
        $("#pgAED").trigger('create');
        this.Views.AEDList.reset();
    },
    onSendClicked: function (msg) {
        $.mobile.loading('show', {
            text: 'Saving feedback',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        var user = JSON.parse(localStorage.getItem("customerData"));
        this.Model.sendFeedback(user, msg);
    },
    onMaintSaveClicked: function (maintenanceStatus) {
        $.mobile.loading('show', {
            text: 'Saving data',
            textVisible: true,
            theme: 'a',
            html: ""
        });
        this.Model.saveMaintanence(maintenanceStatus);
    },
    /************************************************************************************************/
    //  Error Message
    /************************************************************************************************/
    onServerRequestError: function (data, errors) {
        $.mobile.loading('hide');
        alert('Unknown error occurred. Please try again later!', null, "Oops", "OK");
    }
};

(function () {
    var proxied = window.alert;
    window.alert = function (message, callback, title, buttonName) {
        // do something here
        if (navigator.notification) {
            return navigator.notification.alert(message, callback, title, buttonName);
        }
        return proxied.apply(this, [message, callback, title, buttonName]);
    }; 
})();