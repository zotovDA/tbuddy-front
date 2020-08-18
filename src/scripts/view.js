import unauthorizedTemplate from '../templates/header/_unauthorized.hbs';
import authorizedTemplate from '../templates/header/_authorized.hbs';
import authErrorTemplate from '../templates/auth/authError.hbs';

/**
 * Update profile control in nav menu
 * @param {{name: string} | null} user
 */
export function updateNavUser(user) {
  const profileNavControl = document.getElementById('js-nav-profile');
  if (!profileNavControl) {
    return null;
  } else {
    if (!user) {
      profileNavControl.innerHTML = unauthorizedTemplate();
    } else {
      profileNavControl.innerHTML = authorizedTemplate({
        name: user.name,
      });
    }
  }
}

export function drawAuthHandlerError() {
  const messageNode = document.getElementById('js-auth-handler-message');

  messageNode.innerHTML = authErrorTemplate();
}
