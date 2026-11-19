# TeacherDesk Marketing Website (`teacherdesk.org`)

Static marketing site for **TeacherDesk** — the FERPA-first IEP/504 accommodations monitor, human-in-the-loop grading queue, and learning-gap analytics workspace for Canvas LMS teachers.

- **Production app:** https://ecr.teacherdesk.org
- **Hosting:** Netlify (`teacherdesk-org`) with zero build steps (`publish = "."`)
- **Inquiry form:** Handled via Netlify Forms (`name="teacherdesk-inquiry"`)

## Local Preview

```bash
npx serve .
# or with Python:
python -m http.server 8080
```
