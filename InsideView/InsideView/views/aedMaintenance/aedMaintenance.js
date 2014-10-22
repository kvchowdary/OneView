AGS.Views.AEDMaintenance = function (options) {
    var defaults = {
        containerSelector: null,
        eventHandlers: {
            rendered: function () { },
            onMaintSaveClicked: null
        }
    };
    this.options = $.extend(defaults, options);
    var _this = this;
    this.data = null;

    this.tm = new TemplateManager({
        templateName: 'AMList',
        templateUri: 'js/views/aedMaintenance/aedMaintenance.html',
        parameters: [],
        containerElement: this.options.containerSelector,
        eventHandlers: { onRendered: function () { _this.onRendered(); } }
    });
    this.resetPopup = function () {
        $("#maintenanceHeading").text("");
        try {
            $("#radio-choice-1").attr("checked", false).checkboxradio("refresh");
            $("#radio-choice-2").attr("checked", false).checkboxradio("refresh");
            $("#chkScan").attr("checked", false).checkboxradio("refresh");
        } catch (e) {
            $("#radio-choice-1").attr("checked", false);
            $("#radio-choice-2").attr("checked", false);
            $("#chkScan").attr("checked", false);
        }
        $("#txtcomments").val("");

        $("#divBarcodeText").hide();
        $("#txtBarcodeText").val("");
        $("#btnScan").show();
        $(this).addClass("chkScan");
    };
};
AGS.Views.AEDMaintenance.prototype = {
    setData: function (data) {
        this.tm.Render(data, this);
    },
    /******************************************************************************************
    Event handling
    ******************************************************************************************/
    onRendered: function () {
        this.attachEvents();
        if (this.options.eventHandlers.rendered)
            this.options.eventHandlers.rendered();
    },
    attachEvents: function () {
        var _this = this;
        $('.MviewBtn').click(function () {
            var _curAED = this;
            var scanCode = "";
            _this.resetPopup();
            $("#maintenanceHeading").text($(this).jqmData("serial"));
            $("#pLocation").text($(this).jqmData("aedlocation"));
            $("#divCustomeName").text($(this).jqmData("aedcustomename"));
            if ($(this).jqmData("passed")) {
                try {
                    $("#radio-choice-1").attr("checked", true).checkboxradio("refresh");
                } catch (e) {
                    $("#radio-choice-1").attr("checked", true);
                }

            } else {
                if ($(this).jqmData("needservice")) {
                    try {
                        $("#radio-choice-2").attr("checked", true).checkboxradio("refresh");
                    } catch (e) {
                        $("#radio-choice-2").attr("checked", true);
                    }
                    $("#AEDComments").show();
                    $("#txtcomments").val($(this).jqmData("comment"));
                }
            }

            $("#chkScan").unbind('click');
            $("#chkScan").click(function () {
                if ($(this).hasClass("chkScan")) {
                    $("#divBarcodeText").show();
                    $("#txtBarcodeText").val("");
                    $(this).removeClass("chkScan");
                }
                else {
                    $("#divBarcodeText").hide();
                    $(this).addClass("chkScan");
                }
            });

            $("#btnSave").unbind('click');
            $('#btnSave').click(function () {
                var status = true;
                if (($("#radio-choice-1").is(':checked') == false) && ($("#radio-choice-2").is(':checked') == false)) {
                    alert("Please select AED status", null, "AED Maintenance", "OK");
                    return;
                }

                if ($("#radio-choice-2").is(':checked') && ($.trim($("#txtcomments").val()) == "")) {
                    alert("Please enter comments", null, "AED Maintenance", "OK");
                    return;
                }

                if ($("#divBarcodeText").is(':visible')) {

                    if (($.trim($("#txtBarcodeText").val()) == "")) {
                        alert("Please enter device barcode", null, "AED Maintenance", "OK");
                        return;
                    }
                    if (isNumber($.trim($("#txtBarcodeText").val())) && isNumber($(_curAED).jqmData("serial"))) {
                        if ($(_curAED).jqmData("serial").toLowerCase() != $.trim($("#txtBarcodeText").val()).toLowerCase()) {
                            alert("Please enter correct serial number.", null, "AED Maintenance", "OK");
                            return;
                        }
                    } else if ($(_curAED).jqmData("serial") != $.trim($("#txtBarcodeText").val())) {
                        alert("Please enter correct serial number.", null, "AED Maintenance", "OK");
                        return;
                    }

                }
                else {
                    if (scanCode == "") {
                        alert("Please scan the device", null, "AED Maintenance", "OK");
                        return;
                    }

                }
                var maintenanceStatus = {};
                maintenanceStatus.AEDRecordId = $(_curAED).jqmData("recid");
                maintenanceStatus.Comment = $("#txtcomments").val();
                maintenanceStatus.CustomerId = $(_curAED).jqmData("custid");
                maintenanceStatus.IsChecked = true;
                maintenanceStatus.MaintenanceRecordId = $(_curAED).jqmData("maintrecid");
                maintenanceStatus.NeedService = $("#radio-choice-2").is(':checked') ? true : false;
                maintenanceStatus.Id = $(_curAED).jqmData("id");
                var user = JSON.parse(localStorage.getItem("customerData"));
                maintenanceStatus.CheckedBy = user.Email;
                _this.options.eventHandlers.onMaintSaveClicked(maintenanceStatus);
            });

            $("#btnSaveSN").unbind('click');
            $('#btnSaveSN').click(function () {
                var status = true;
                if (($("#radio-choice-1").is(':checked') == false) && ($("#radio-choice-2").is(':checked') == false)) {
                    alert("Please select AED status", null, "AED Maintenance", "OK");
                    return;
                }

                if ($("#radio-choice-2").is(':checked') == true) {

                    if ($.trim($("#txtcomments").val()) == '') {
                        alert("Please enter comments", null, "AED Maintenance", "OK");
                        return;
                    }
                }

                if ($("#radio-choice-2").is(':checked') && ($.trim($("#txtcomments").val()) == "")) {
                    alert("Please enter comments", null, "AED Maintenance", "OK");
                    return;
                }

                var maintenanceStatus = {};
                maintenanceStatus.AEDRecordId = $(_curAED).jqmData("recid");
                maintenanceStatus.Comment = $("#txtcomments").val();
                maintenanceStatus.CustomerId = $(_curAED).jqmData("custid");
                maintenanceStatus.IsChecked = true;
                maintenanceStatus.MaintenanceRecordId = $(_curAED).jqmData("maintrecid");
                maintenanceStatus.NeedService = $("#radio-choice-2").is(':checked') ? true : false;
                maintenanceStatus.Id = $(_curAED).jqmData("id");
                var user = JSON.parse(localStorage.getItem("customerData"));
                maintenanceStatus.CheckedBy = user.Email;
                _this.options.eventHandlers.onMaintSaveClicked(maintenanceStatus);
            });

            $("#btnScan").unbind('click');
            $("#btnScan").click(function () {
                $(this).addClass("chkScan");
                $("#txtBarcodeText").val("");
                $("#divBarcodeText").hide();
                scanCode = "";
                try {
                    var scanner = cordova.require("cordova/plugin/BarcodeScanner");
                    scanner.scan(function (result) {
                        if (!result.cancelled) {
                            navigator.notification.vibrate(1000);
                            navigator.notification.beep(1);
                            //                                    alert("We got a barcode\n" +
                            //                                "Result: " + result.text + "\n" +
                            //                                "Format: " + result.format + "\n" +
                            //                                "Cancelled: " + result.cancelled);
                            var res = result.text;

                            if (isNumber(res)) {
                                try {
                                    if ($(_curAED).jqmData("serial").toLowerCase() != res.toLowerCase()) {
                                        alert("Serial number doesn't match\n" + "Scanned Barcode: " + res, null, "AED Maintenance", "OK");
                                    } else {
                                        alert("Scan success\n" + "Scanned Barcode: " + res, null, "AED Maintenance", "OK");
                                        scanCode = res;
                                    }
                                } catch (e) {
                                    alert("Serial number doesn't match\n" + "Scanned Barcode: " + res, null, "AED Maintenance", "OK");
                                }

                            } else {
                                if ($(_curAED).jqmData("serial") != res) {
                                    alert("Serial number doesn't match\n" + "Scanned Barcode: " + res, null, "AED Maintenance", "OK");
                                } else {
                                    alert("Scan success\n" + "Scanned Barcode: " + res, null, "AED Maintenance", "OK");
                                    scanCode = res;
                                }
                            }
                        }
                    }, function (error) {
                        alert("Scanning failed: " + error, null, "AED Maintenance", "OK");
                    });
                } catch (ex) {
                    alert(ex.message, null, "AED Maintenance", "OK");
                }
            });

            $.mobile.changePage("#pgMaintEdit");
        });

        $("#radio-choice-1").change(function () {
            if ($(this).is(':checked')) {
                $("#txtcomments").val("");
            }
        });

        $("#radio-choice-2").change(function () {
            $("#txtcomments").val("");
        });

    }
};

function isNumber(txt) {
    var isNum = true;
    try {
        isNum = isNaN(txt);
    } catch (e) {
        isNum = false;
    }
    return isNum;
}