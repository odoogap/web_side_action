odoo.define('web.sideaction',function(require){
"use strict";
    
    var core = require('web.core');
    var qweb = core.qweb;
    var _t = core._t;

    var Model = require('web.Model');
    var ajax = require('web.ajax');
    
    var ListView = require('web.ListView');
    var KanbanView = require('web_kanban.KanbanView');
    var FormView = require('web.FormView');

    var data = require('web.data');
    var pyeval = require('web.pyeval');

    var ControllerMixin = {
        custom_init: function (parent, state, params) {
            this.side_action = '';
            if(this.fields_view.arch.attrs.side_action)
                this.side_action = this.fields_view.arch.attrs.side_action.split(',');
        },
        _clickExtraButtons: function (event) {
            var self = this;
            event.stopPropagation();
            var action_data = this.sideactions[$(event.target).data('action')];
            var isFormView = $(event.target.parentNode).hasClass('o_form_buttons_view');
            if(isFormView){
                var active_id = self.datarecord.id;

                var tempctx = new data.CompoundContext(action_data.context)
                    .set_eval_context({
                        active_id: active_id,
                        active_ids: [active_id],
                        active_model: self.model,
                    });
                var context = pyeval.eval('context',tempctx);                
                action_data.context = context;
            }
            this.do_action(action_data);
        },
        get_action_details: function(action_data){
            return new Model(action_data.type).call('read', [action_data.id, ["type","name","tag","res_model","views","view_type","view_mode","target","context","domain"]]);
        },
        get_action_type: function(action_id){
            return new Model('ir.actions.actions').call('read', [action_id, ["type","name"]]);
        },
        get_action: function(xmlid){
            return new Model('ir.model.data').call('xmlid_to_res_id', {xmlid: xmlid});
        },
        setname_custombuttons: function(){
            var self = this;
            _.each(self.sideactions, function(side_action, side_action_key){
                $(document).find("[data-action='" + side_action_key + "']").html(side_action.name);
            });
        },
        setup_extra_buttons: function(){
            var self = this;
            if(!self.side_action){
                return;
            }
            _.each(self.side_action, function(side_action){
                self.get_action(side_action).then(function(action_id){
                    if(!action_id){
                        self.invalid_sideaction = true;
                        self.do_warn(_t("Invalid xmlid(s) in side_action: " + side_action));
                        return;
                    }
                    self.get_action_type(action_id).then(function(action_data){
                        var action_data = action_data[0];
                        self.get_action_details(action_data).then(function (finalresult) {
                            self.invalid_sideaction = false;
                            self.sideactions[side_action] = finalresult[0];
                            $(document).find("[data-action='" + side_action + "']").html(action_data.name);
                            self.setname_custombuttons();
                        });
                    })
                });
            });
        },
        _bindButtons: function () {
            var self = this;
            self.sideactions = {}
            self.setup_extra_buttons();
            self.setname_custombuttons();
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
        setname_custombuttons: function(){
            ControllerMixin.setname_custombuttons.apply(this, arguments);
        },
        render_buttons: function ($node) {
            var self = this;
            ControllerMixin._bindButtons.call(this);
            this._super.apply(this, arguments);
            self.setname_custombuttons();
            if(this.$buttons)
                this.$buttons.on('click', '.o_list_button_extra', this._clickExtraButtons.bind(this));
        },
        _clickExtraButtons: function (event) {
            ControllerMixin._clickExtraButtons.apply(this, arguments);
        },
    };

    ListView.include(CommonRendererMixin);
    KanbanView.include(CommonRendererMixin);
    FormView.include(CommonRendererMixin);

    ListView.include(CommonControllerMixin);
    KanbanView.include(CommonControllerMixin);
    FormView.include(CommonControllerMixin);

});
