/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

let menuButton = document.getElementById("PanelUI-menu-button");

add_task(function* testButtonActivities() {
  is(menuButton.hasAttribute("badge-status"), false, "Should not have a badge status");
  is(menuButton.hasAttribute("badge"), false, "Should not have the badge attribute set");

  gMenuButtonBadgeManager.addBadge(gMenuButtonBadgeManager.BADGEID_FXA, "fxa-needs-authentication");
  is(menuButton.getAttribute("badge-status"), "fxa-needs-authentication", "Should have fxa-needs-authentication badge status");

  gMenuButtonBadgeManager.addBadge(gMenuButtonBadgeManager.BADGEID_APPUPDATE, "update-succeeded");
  is(menuButton.getAttribute("badge-status"), "update-succeeded", "Should have update-succeeded badge status (update > fxa)");

  gMenuButtonBadgeManager.addBadge(gMenuButtonBadgeManager.BADGEID_APPUPDATE, "update-failed");
  is(menuButton.getAttribute("badge-status"), "update-failed", "Should have update-failed badge status");

  gMenuButtonBadgeManager.addBadge("unknownbadge", "attr");
  is(menuButton.getAttribute("badge-status"), "update-failed", "Should not have changed badge status");

  gMenuButtonBadgeManager.removeBadge(gMenuButtonBadgeManager.BADGEID_APPUPDATE);
  is(menuButton.getAttribute("badge-status"), "fxa-needs-authentication", "Should have fxa-needs-authentication badge status");

  gMenuButtonBadgeManager.removeBadge(gMenuButtonBadgeManager.BADGEID_FXA);
  is(menuButton.hasAttribute("badge-status"), false, "Should not have a badge status");

  yield PanelUI.show();
  is(menuButton.hasAttribute("badge-status"), false, "Should not have a badge status (Hamburger menu opened)");
  PanelUI.hide();

  gMenuButtonBadgeManager.addBadge(gMenuButtonBadgeManager.BADGEID_FXA, "fxa-needs-authentication");
  gMenuButtonBadgeManager.addBadge(gMenuButtonBadgeManager.BADGEID_UPDATE, "update-succeeded");
  gMenuButtonBadgeManager.clearBadges();
  is(menuButton.hasAttribute("badge-status"), false, "Should not have a badge status (clearBadges called)");
});
