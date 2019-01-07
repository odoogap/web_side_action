odoo.define('web.sideaction',function(require){
"use strict";
	
	var ListController = require("web.ListController");
	var ListRenderer = require("web.ListRenderer");
	require('web.ViewManager');
	var core = require('web.core');
	var qweb = core.qweb;
	
	ListRenderer.include({
	    init: function (parent, state, params) {
        	this._super.apply(this, arguments);
        	this.side_action = this.arch.attrs.side_action;
        	console.log("this.side_action ", this.side_action);
	    },
	});

	ListController.include({
		renderButtons: function ($node) {
			var self = this;
            this.side_action = this.renderer.side_action;
        	self.side_action_name = '';
        	self.sideactions = {}
        	if(!this.side_action){
        		self._super.apply(this, arguments);
        		return;
        	}
        	self._rpc({
                model: 'ir.model.data',
                method: 'xmlid_to_res_id',
                kwargs: {xmlid: this.side_action},
            }).then(function(action_id){
	        	self._rpc({
	                model: 'ir.actions.actions',
	                method: 'read',
	                args: [action_id, ["type","name"]],
	            }).then(function (result) {
	            	var result = result[0];
	            	self.side_action_name = result.name;
	            	$(document).find("[data-action='" + self.side_action + "']").html(self.side_action_name);
		        	self._rpc({
		                model: result.type,
		                method: 'read',
		                args: [result.id, ["type","name","tag","res_model","views","view_type","view_mode","target","context","domain"]],
		            }).then(function (finalresult) {
		            	self.sideactions[self.side_action] = finalresult[0];
		            });
	            });
            });
			self._super.apply(this, arguments);
            self.$buttons.on('click', '.o_list_button_extra', this._clickExtraButtons.bind(this));
		},
	    _clickExtraButtons: function (event) {
	        event.stopPropagation();
	        var action_data = this.sideactions[$(event.target).data('action')];
	        this.do_action(action_data);
	    },

	});

});
