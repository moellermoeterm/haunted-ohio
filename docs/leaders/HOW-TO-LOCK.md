# How to lock (and re-lock) the leader page

The teacher page (`teacher/index.html`) explains that each game assigns one of its six cases at random, and has six leader-preview links per game. On the live site it is a **locked page**: it shows a password screen, and only someone who types the right password sees the tools. The Leaders page has a visible link to it, **Leader tools (password required)**. Students can see that link and the password screen, but they cannot see the tools without the password.

## Before you start
- This is a **lock in the browser**. It keeps casual visitors out. It is only as strong as the password, so pick a long one (16 or more characters, such as four or five unrelated words). The password is the real protection.
- **Never write the password in the repo**: not in a file, a comment, a commit message, an issue, a pull request, or a test. **Share it with the other leaders in person or by school email.** Nothing private belongs on this site.
- Anything that was ever in the repo stays in the repo's history. Locking the page does not hide what was already published. Do not put sensitive documents (contacts, permissions, medical information, costs) on this site at all. Keep those in Microsoft 365.
- If you forget the password there is no recovery. Lock the plain page again with a new password.

## How to re-lock (new password, or an updated page)
The plain page is kept in the repo at `tests/fixtures/_teacher-page.html`. It is the source you lock. (The live `teacher/index.html` holds only the encrypted copy.)

1. Open the lock tool in your browser: `https://moellermoeterm.github.io/haunted-ohio/tools/lock.html`. It is not linked from anywhere on the site, and it makes no network calls.
2. In GitHub, open `tests/fixtures/_teacher-page.html`, choose **Raw**, select everything (Ctrl+A or Cmd+A), copy, and paste it into the big box on the lock tool. (If you changed the teacher page, change this file first so the plain copy stays up to date.)
3. Type the password, then type it again in **Confirm the password**. Use **Show passwords** to check what you typed.
   - Under 12 characters is refused.
   - 12 to 15 characters works but shows a warning that it is easy to guess.
4. Press **Encrypt**. Your browser downloads a file named `index.html`. That is the locked teacher page. The password boxes clear themselves.
5. **Rename the download to exactly `index.html`.** Browsers rename a second download to `index (1).html` or `index (2).html`. **Never upload it under such a name.**
6. In GitHub, open the `teacher` folder, then **Add file, Upload files**, and upload the file so that it replaces `teacher/index.html`. It must be named exactly `index.html` and go **inside the `teacher` folder** (not the main folder). After committing, check that no extra copy such as `index (2).html` appeared anywhere.
7. When the Pages deploy finishes, open the course site in a **private (incognito) window** and test it:
   - The Leaders page shows **Leader tools (password required)**. Click it.
   - `/teacher/` shows "Leader tools" and a box that says **Enter the leader password**.
   - A wrong password shows "That password didn't work." and waits a little longer after each failed try.
   - The right password opens the leader tools: the note about random cases and the leader-preview links. **Lock again** (bottom right) puts the prompt back.

## Cases are assigned at random (re-lock needed once)
- Each game picks one of its six cases at random the first time a student begins on a device, and keeps it. Students do not choose and are not shown which one they have. Two neighbors can get the same case by chance. Clearing the browser's site data, or "Erase my progress" in a game's settings, picks again.
- Leaders can look at any case from the leader tools: each preview link opens that case with a clear "Leader preview" banner and a throwaway save that never changes a student's game or assigned case. Do not share preview links with students.
- The plain copy (`tests/fixtures/_teacher-page.html`) was updated for this. **The live locked page does not change by itself.** Re-lock it once using the steps above: run the lock tool on the plain copy, name the download exactly `index.html`, and upload it into the `teacher` folder by hand. Until you do, the live locked page still shows the old case links, which now just open the game without choosing a case.

## Good to know
- The site's automated tests do not read the live `teacher/index.html` for the tools. They use the plain copy at `tests/fixtures/_teacher-page.html`, so they keep passing while the locked file is live. Another test checks that the live `teacher/index.html` really is a locked page (encrypted, with no readable tool text), so a plain copy uploaded by mistake would be caught. The fixture's name starts with an underscore so the GitHub Pages build leaves it out of the published site, and no page links to it. Because it is a plain copy in the repo, **do not put anything sensitive in the teacher page**.
- Give the password to the other leaders in person or by school email. Never in a message, a document or the repo.
