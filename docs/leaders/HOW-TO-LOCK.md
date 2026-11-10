# How to lock the leader page

The teacher page (`teacher/index.html`) has the six case-code links for each game and the seating helper. These steps turn it into a page that asks for a password. **Nothing changes on the live site until you upload the locked file.**

## Important: the live page is not locked until you re-upload it
The lock screen was improved after the first version. **Merging that change does not change the live `teacher/index.html`.** After it is merged, a leader has to run the lock tool again and upload the new locked file by hand (steps below). Until then the old teacher page stays as it is. Check in a private window that `teacher/` shows the lock screen and not the tools.

## How leaders find the sign-in link
Students never see a link to the leader tools. Leaders open the course site with `?leader=1` in the address:

`https://moellermoeterm.github.io/haunted-ohio/?leader=1#leaders`

On the Leaders page a small **Leader sign-in** link (with a padlock) then appears. It goes to the locked teacher page, which asks for the password. The link is only shown while `?leader=1` is in the address. Nothing is saved on the device. This hides the link, it is not security: anyone who reads the site's code can find the address. **The password is the real protection.**

## Before you start
- This is a **lock in the browser**. It keeps casual visitors out. It is only as strong as the password, so pick a long one (16 or more characters, such as four or five unrelated words).
- **Never write the password in the repo**: not in a file, a comment, a commit message, an issue, a pull request, or a test. Share it with the other leaders **in person or by school email**. Nothing private belongs on this site.
- Anything that was ever in the repo stays in the repo's history. Locking the page does not hide what was already published. Do not put sensitive documents (contacts, permissions, medical information, costs) on this site at all. Keep those in Microsoft 365.

## Steps
1. Open the lock tool in your browser: `https://moellermoeterm.github.io/haunted-ohio/tools/lock.html`. It is not linked from anywhere on the site, and it makes no network calls.
2. In GitHub, open `teacher/index.html`, choose **Raw**, select everything (Ctrl+A or Cmd+A), copy, and paste it into the big box on the lock tool.
3. Type the password, then type it again in **Confirm the password**. Use **Show passwords** to check what you typed.
   - Under 12 characters is refused.
   - 12 to 15 characters works but shows a warning that it is easy to guess.
4. Press **Encrypt**. Your browser downloads a file named `index.html`. That is the locked teacher page. The password boxes clear themselves.
5. In GitHub, open the `teacher` folder, then **Add file, Upload files**, and upload the downloaded file so that it replaces `teacher/index.html`. **The file must be named exactly `index.html` and must go inside the `teacher` folder.** Browsers sometimes rename a second download to `index (2).html`; rename it to `index.html` before you upload, and check that no stray copy (for example `index (2).html` in the main folder) was added. Commit it.
6. When the Pages deploy finishes, open the teacher page in a **private (incognito) window**. You should see "Leader tools" and a box that says **Enter the leader password**.
   - A wrong password shows "That password didn't work." and waits a little longer after each failed try.
   - The right password opens the leader tools. The seating helper and the game links work as before.
   - **Lock again** (bottom right) puts the prompt back.

## Good to know
- To change the password, or to update the page, lock the plain page again with the tool and upload the new file.
- The site's automated tests do not read the live `teacher/index.html`. They use a plain copy at `tests/fixtures/_teacher-page.html`, so they keep passing once the locked file is live. If you change the teacher page later, update that copy too (paste the new plain page over it). The copy's name starts with an underscore so the GitHub Pages build leaves it out of the published site, and no page links to it. Because it is a plain copy in the repo, **do not put anything sensitive in the teacher page**.
- If you forget the password there is no recovery. Lock the plain page again with a new password.
- Leaders: the Leaders page says "Leader tools are available from your course leaders." Give the address of the teacher page and the password to leaders in person or by school email.
