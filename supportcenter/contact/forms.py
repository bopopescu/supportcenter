# -*- coding: utf-8 -*-

__all__ = ('ContactForm',)

from django import forms
from lethusbox.django.fields import BRPhoneNumberField
from django.utils.translation import ugettext_lazy as _

from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives

from supportcenter.settings import DEPLOY_URL

class ContactForm(forms.Form):
    name = forms.CharField(
        label=_('Name'),
        required=True,
        max_length=64, 
        widget=forms.TextInput(attrs={'class': 'span5'}),
        help_text=_('Enter your first and last name.'))

    phone = BRPhoneNumberField(
        label = _('Phone'),
        required = True,
        error_messages={'invalid' :u"Número de telefone inválido!"})

    email = forms.EmailField(
        label=_("E-mail"), 
        max_length=75,
        help_text=_('Enter a valid email address.'))

    subject = forms.CharField(
        label=_('Subject'),
        required=True,
        widget=forms.TextInput(attrs={'class': 'span5'}))

    message = forms.CharField(
        label=_('Message'),
        required=True,
        widget=forms.Textarea(attrs={'class': 'input-xxlarge'}))


    def __init__(self, *args, **kwargs):
        super(ContactForm, self).__init__(*args, **kwargs)
            
    def save(self):
        context = {
            'name': self.cleaned_data['name'],
            'email':  self.cleaned_data['email'],
            'message':  self.cleaned_data['message'],
            'site': {
                'domain': DEPLOY_URL,
                'name': "Lethus support center"
            }
        }
        
        subject = "Contact SupportCenter"
        subject_user = "Reply SupportCenter"
        message = self.cleaned_data['message']
        email = str(self.cleaned_data['email'])

        
        subject = u' '.join(line.strip() for line in subject.splitlines()).strip()
        msg = EmailMultiAlternatives(subject, message, to=['suporte@lethus.com.br'], headers = {'Reply-To': email})
        msg.attach_alternative(message, 'text/html')
        msg.send()

        subject_user = u' '.join(line.strip() for line in subject_user.splitlines()).strip()
        msg_user = EmailMultiAlternatives(subject_user, message, to=[email], headers = {'Reply-To': 'suporte@lethus.com.br'})
        msg_user.attach_alternative(message, 'text/html')
        msg_user.send()
