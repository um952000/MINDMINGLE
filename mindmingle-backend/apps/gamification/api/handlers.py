def handle_doubt_created(user, **kwargs):
    user.user_level.add_reputation(2, 'doubt_asked')


def handle_answer_created(user, **kwargs):
    user.user_level.add_reputation(3, 'answer_given')


def handle_answer_accepted(user, **kwargs):
    user.user_level.add_reputation(15, 'answer_accepted')


def handle_upvote(user, target_type=None, **kwargs):
    if target_type == 'doubt':
        user.user_level.add_reputation(3, 'doubt_upvoted')
    elif target_type == 'answer':
        user.user_level.add_reputation(3, 'answer_upvoted')


def handle_downvote(user, target_type=None, **kwargs):
    if target_type == 'doubt':
        user.user_level.add_reputation(-1, 'doubt_downvoted')
    elif target_type == 'answer':
        user.user_level.add_reputation(-1, 'answer_downvoted')


def handle_user_login(user, **kwargs):
    user.user_level.update_streak()