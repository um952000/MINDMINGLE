# class EventDispatcher:
#     _handlers = {}

#     @classmethod
#     def register(cls, event_name, handler):
#         cls._handlers.setdefault(event_name, []).append(handler)

#     @classmethod
#     def dispatch(cls, event_name, **kwargs):
#         handlers = cls._handlers.get(event_name, [])
#         for handler in handlers:
#             handler(**kwargs)

# class EventDispatcher:
#     _handlers = {}

#     @classmethod
#     def register(cls, event_name, handler):
#         if event_name not in cls._handlers:
#             cls._handlers[event_name] = []

#         # ✅ prevent duplicate registration
#         if handler not in cls._handlers[event_name]:
#             cls._handlers[event_name].append(handler)

#     @classmethod
#     def dispatch(cls, event_name, **kwargs):
#         for handler in cls._handlers.get(event_name, []):
#             handler(**kwargs)

class EventDispatcher:
    _handlers = {}

    @classmethod
    def register(cls, event_name, handler):
        if event_name not in cls._handlers:
            cls._handlers[event_name] = []

        if handler not in cls._handlers[event_name]:
            cls._handlers[event_name].append(handler)

    @classmethod
    def dispatch(cls, event_name, **kwargs):
        print(f"\n🚀 EVENT FIRED: {event_name}")

        for handler in cls._handlers.get(event_name, []):
            print(f"➡️ Handler: {handler.__name__}")
            handler(**kwargs)