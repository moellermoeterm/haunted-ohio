# How to lock the leader page

The teacher page (`teacher/index.html`) has the six case-code links for each game and the seating helper. These steps turn it into a page that asks for a password. **Nothing changes on the live site until you upload the locked file.**

## Before you start
- This is a **lock in the browser**. It keeps casual visitors out. It is only as strong as the password, so pick a long one (16 or more characters, such as four or five unrelated words).
- **Never write the password in the repo**: not in a file, a comment, a commit message, an issue, a pull request, or a test. Share it with the other leaders **in person or by school email**.
- Anything that was ever in the repo stays in the repo's history. Locking the page does not hide what was already published. Do not put sensitive documents (contacts, permissions, medical information, costs) on this site at all. Keep those in Microsoft 365.

## Steps
1. Open the lock tool in your browser: `https://moellermoeterm.github.io/haunted-ohio/tools/lock.html`. It is not linked from anywhere on the site, and it makes no network calls.
2. In GitHub, open `teacher/index.html`, choose **Raw**, select everything (Ctrl+A or Cmd+A), copy, and paste it into the big box on the lock tool.
3. Type the password, then type it again in **Confirm the password**. Use **Show passwords** to check what you typed.
   - Under 12 characters is refused.
   - 12 to 15 characters works but shows a warning that it is easy to guess.
4. Press **Encrypt**. Your browser downloads a file named `index.html`. That is the locked teacher page. The password boxes clear themselves.
5. In GitHub, open `teacher/index.html`, choose **Edit** (or **Add file, Upload files** inside the `teacher` folder), and replace the file with the downloaded `index.html`. Commit it.
6. When the Pages deploy finishes, open the teacher page in a **private (incognito) window**. You should see "Leader tools" and a box that says **Enter the leader password**.
   - A wrong password shows "That password didn't work." and waits a little longer after each failed try.
   - The right password opens the leader tools. The seating helper and the game links work as before.
   - **Lock again** (bottom right) puts the prompt back.

## Good to know
- To change the password, or to update the page, lock the plain page again with the tool and upload the new file.
- The site's automated tests do not read the live `teacher/index.html`. They use a plain copy at `tests/fixtures/_teacher-page.html`, so they keep passing once the locked file is live. If you change the teacher page later, update that copy too (paste the new plain page over it). The copy's name starts with an underscore so the GitHub Pages build leaves it out of the published site, and no page links to it. Because it is a plain copy in the repo, **do not put anything sensitive in the teacher page**.
- If you forget the password there is no recovery. Lock the plain page again with a new password.
- Leaders: the Leaders page says "Leader tools are available from your course leaders." Give the address of the teacher page and the password to leaders in person or by school email.
