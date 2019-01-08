odoo.define('web.sideaction',function(require){
"use strict";
    
    var core = require('web.core');
    var qweb = core.qweb;

    var ListController = require("web.ListController");
    var ListRenderer = require("web.ListRenderer");

    var KanbanController = require('web.KanbanController');
    var KanbanRenderer = require('web.KanbanRenderer');

    var FormController = require('web.FormController');
    var FormRenderer = require('web.FormRenderer');

    var _t = core._t;
    var ControllerMixin = {
        custom_init: function (parent, state, params) {
            this.side_action = this.arch.attrs.side_action;
        },
        _clickExtraButtons: function (event) {
            event.stopPropagation();
            var action_data = this.sideactions[$(event.target).data('action')];
            this.do_action(action_data);
        },
        get_action_details: function(action_data){
            return this._rpc({
                model: action_data.type,
                method: 'read',
                args: [action_data.id, ["type","name","tag","res_model","views","view_type","view_mode","target","context","domain"]],
            });
        },
        get_action_type: function(action_id){
            return this._rpc({
                model: 'ir.actions.actions',
                method: 'read',
                args: [action_id, ["type","name"]],
            });
        },
        get_action: function(xmlid){
            return this._rpc({
                model: 'ir.model.data',
                method: 'xmlid_to_res_id',
                kwargs: {xmlid: xmlid},
            });
        },
        setup_extra_buttons: function(){
            var self = this;
            if(!self.side_action){
                return;
            }
            self.get_action(self.side_action).then(function(action_id){
                if(!action_id){
                    self.invalid_sideaction = true;
                    self.do_warn(_t("Invalid xmlid in side_action: " + self.side_action));
                    return;
                }
                self.get_action_type(action_id).then(function(action_data){
                    var action_data = action_data[0];
                    self.side_action_name = action_data.name;
                    $(document).find("[data-action='" + self.side_action + "']").html(self.side_action_name);

                    self.get_action_details(action_data).then(function (finalresult) {
                        self.invalid_sideaction = false;
                        self.sideactions[self.side_action] = finalresult[0];
                        self.$buttons.on('click', '.o_list_button_extra', self._clickExtraButtons.bind(self));
                    });
                })
            });
        },
        _bindButtons: function () {
            var self = this;
            self.side_action = this.renderer.side_action;
            self.side_action_name = '';
            self.sideactions = {}
            self.setup_extra_buttons();
        },
    };

    var CommonRendererMixin = {
        init: function (parent, state, params) {
            this._super.apply(this, arguments);
            ControllerMixin.custom_init.apply(this, arguments);
        },
    };

    var CommonControllerMixin = {
        get_action_details: function(action_data){
            return ControllerMixin.get_action_details.apply(this, arguments);
        },
        get_action_type: function(action_id){
            return ControllerMixin.get_action_type.apply(this, arguments);
        },
        get_action: function(xmlid){
            return ControllerMixin.get_action.apply(this, arguments);
        },
        setup_extra_buttons: function(){
            ControllerMixin.setup_extra_buttons.apply(this, arguments);
        },
        renderButtons: function ($node) {
            ControllerMixin._bindButtons.call(this);
            this._super.apply(this, arguments);
        },
        _clickExtraButtons: function (event) {
            ControllerMixin._clickExtraButtons.apply(this, arguments);
        },
    };

    ListRenderer.include(CommonRendererMixin);
    ListController.include(CommonControllerMixin);

    KanbanRenderer.include(CommonRendererMixin);
    KanbanController.include(CommonControllerMixin);

    FormRenderer.include(CommonRendererMixin);
    FormController.include(CommonControllerMixin);

});
