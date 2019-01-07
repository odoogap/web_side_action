# -*- coding: utf-8 -*-

import os
import logging
from lxml import etree

from odoo import tools
import odoo
from odoo.tools.view_validation import relaxng, _relaxng_cache

_logger = logging.getLogger(__name__)


def custom_relaxng(view_type):
    """
        Inherit the rng validation process to include custom rng files which include our custom attributes.
    """
    rng_name = os.path.join('base', 'rng', '%s_view.rng' % view_type)
    if view_type == 'tree':
        rng_name = os.path.join('web_side_action', 'rng', '%s_view.rng' % view_type)

    if view_type not in _relaxng_cache:
        with tools.file_open(rng_name) as frng:
            try:
                relaxng_doc = etree.parse(frng)
                _relaxng_cache[view_type] = etree.RelaxNG(relaxng_doc)
            except Exception:
                _logger.exception('Failed to load RelaxNG XML schema for views validation %s' % (view_type))
                _relaxng_cache[view_type] = None
    return _relaxng_cache[view_type]


odoo.tools.view_validation.relaxng = custom_relaxng
