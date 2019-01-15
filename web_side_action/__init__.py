# -*- coding: utf-8 -*-

import os
import logging
from lxml import etree
from openerp import tools
import openerp
import odoo

_logger = logging.getLogger(__name__)


def _custom_relaxng(self):
    if not self._relaxng_validator:
        with tools.file_open(os.path.join('web_side_action', 'rng', 'view.rng')) as frng:
            try:
                relaxng_doc = etree.parse(frng)
                self._relaxng_validator = etree.RelaxNG(relaxng_doc)
            except Exception:
                _logger.exception('Failed to load RelaxNG XML schema for views validation')
    return self._relaxng_validator

from odoo.addons.base.ir.ir_ui_view import View
View._relaxng = _custom_relaxng
