# -*- coding: utf-8 -*-
{
    'name': 'Web Side Action',
    'version': '11.0.1.0',
    'author': 'Odoo Gap',
    'summary': 'Web Side Action',
    'description': """
Web Side Action
=========================
Allows you to add extra buttons on tree/form view that can trigger actions.

Usage:
    <tree side_action="module_name.action_xmlid">
        ...
    </tree>
""",
    'website': 'https://www.odoogap.com',
    'category': 'General',
    'depends': ['base', ],
    'data': [
        'views/views.xml',
    ],
    'demo': [
        'demo/demo.xml',
    ],
    'test': [
    ],
    'qweb': [
        "static/src/xml/side_action.xml",
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
