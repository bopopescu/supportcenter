from django.conf.urls.defaults import patterns, include, url
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.contrib.auth.decorators import login_required
from django.conf import settings

from .views import *

urlpatterns = patterns('',
    url(r'^$', ListForumView.as_view(), name="forum"),
    url(r'^add/',AddForumView.as_view(), name='add_forum'),
    url(r'^update/(?P<id>\d+)/', DetailForumView.as_view(),
        name='update_forum'),

)
