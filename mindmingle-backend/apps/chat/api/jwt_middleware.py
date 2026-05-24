from urllib.parse import parse_qs

from channels.middleware import BaseMiddleware
from channels.db import database_sync_to_async

from rest_framework_simplejwt.tokens import AccessToken
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser

User = get_user_model()


class JWTAuthMiddleware(BaseMiddleware):

    async def __call__(self, scope, receive, send):

        try:

            query_string = scope["query_string"].decode()

            query_params = parse_qs(query_string)

            token = query_params.get("token", [None])[0]

            if token:

                decoded_data = AccessToken(token)

                user_id = decoded_data["user_id"]

                user = await self.get_user(user_id)

                scope["user"] = user

            else:

                scope["user"] = AnonymousUser()

        except Exception as e:

            print("JWT ERROR:", e)

            scope["user"] = AnonymousUser()

        return await super().__call__(scope, receive, send)

    @database_sync_to_async
    def get_user(self, user_id):

        try:
            return User.objects.get(id=user_id)

        except User.DoesNotExist:
            return AnonymousUser()