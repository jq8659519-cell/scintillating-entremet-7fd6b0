import { useState, type FormEvent } from 'react'
import { BookOpen, Braces, Pencil, Plus, Trash2 } from 'lucide-react'
import { Alert, Button, Card, EmptyState, Field, Input, PageHeader, Textarea } from '../../components/ui'
import { KEYS, type Course, type Lesson } from '../../db/schema'
import { deleteCourse, parseCourseJSON, saveCourse } from '../../db/services'
import { useCollection } from '../../hooks/useLocalStorage'
import { cn } from '../../lib/utils'

const emptyLesson = (): Lesson => ({ id: crypto.randomUUID(), title: '', content: '' })
const emptyCourse = (): Course => ({ id: crypto.randomUUID(), title: '', description: '', pointsPerLesson: 10, lessons: [emptyLesson()] })

const JSON_EXAMPLE = `{
  "title": "Intro to Design",
  "description": "Learn the basics of visual design.",
  "pointsPerLesson": 25,
  "lessons": [
    { "title": "Color", "content": "..." },
    { "title": "Typography", "content": "..." }
  ]
}`

export function CourseBuilder() {
  const courses = useCollection<Course>(KEYS.courses)
  const [mode, setMode] = useState<'form' | 'json'>('form')
  const [draft, setDraft] = useState<Course>(emptyCourse)
  const [json, setJson] = useState('')
  const [message, setMessage] = useState<{ tone: 'danger' | 'success'; text: string } | null>(null)
  const isEditing = courses.some((c) => c.id === draft.id)

  function updateLesson(id: string, patch: Partial<Lesson>) {
    setDraft((d) => ({ ...d, lessons: d.lessons.map((l) => (l.id === id ? { ...l, ...patch } : l)) }))
  }

  function onSubmitForm(event: FormEvent) {
    event.preventDefault()
    const lessons = draft.lessons.filter((l) => l.title.trim())
    if (!draft.title.trim() || lessons.length === 0) {
      setMessage({ tone: 'danger', text: 'A course needs a title and at least one lesson with a title.' })
      return
    }
    saveCourse({ ...draft, title: draft.title.trim(), pointsPerLesson: Math.max(0, Math.floor(draft.pointsPerLesson)), lessons })
    setMessage({ tone: 'success', text: `"${draft.title.trim()}" ${isEditing ? 'updated' : 'published'}.` })
    setDraft(emptyCourse())
  }

  function onSubmitJSON(event: FormEvent) {
    event.preventDefault()
    try {
      const course = parseCourseJSON(json)
      saveCourse(course)
      setMessage({ tone: 'success', text: `Imported "${course.title}" with ${course.lessons.length} lessons.` })
      setJson('')
    } catch (err) {
      setMessage({ tone: 'danger', text: err instanceof Error ? err.message : 'Import failed' })
    }
  }

  function edit(course: Course) {
    setMode('form')
    setMessage(null)
    setDraft(structuredClone(course))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function remove(course: Course) {
    if (!window.confirm(`Delete "${course.title}"?`)) return
    deleteCourse(course.id)
    if (draft.id === course.id) setDraft(emptyCourse())
  }

  return (
    <>
      <PageHeader title="Course builder" description="Publish new courses for learners. Changes are saved to the courses collection." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <Card className="flex flex-col gap-5 p-5 lg:col-span-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{isEditing ? 'Edit course' : 'New course'}</h2>
            <div role="tablist" aria-label="Input mode" className="flex gap-1 rounded-lg border border-border p-1">
              {(['form', 'json'] as const).map((m) => (
                <button
                  key={m}
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => { setMode(m); setMessage(null) }}
                  className={cn('inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-sm font-medium', mode === m ? 'bg-primary/15 text-primary' : 'text-muted hover:text-foreground')}
                >
                  {m === 'form' ? <Pencil className="size-3.5" aria-hidden="true" /> : <Braces className="size-3.5" aria-hidden="true" />}
                  {m === 'form' ? 'Form' : 'JSON'}
                </button>
              ))}
            </div>
          </div>

          {message && <Alert tone={message.tone}>{message.text}</Alert>}

          {mode === 'form' ? (
            <form onSubmit={onSubmitForm} className="flex flex-col gap-4">
              <Field label="Title" htmlFor="c-title">
                <Input id="c-title" required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              </Field>
              <Field label="Description" htmlFor="c-desc">
                <Textarea id="c-desc" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
              </Field>
              <Field label="Points per lesson" htmlFor="c-points">
                <Input id="c-points" type="number" min={0} step={1} className="w-32" value={draft.pointsPerLesson} onChange={(e) => setDraft({ ...draft, pointsPerLesson: Number(e.target.value) })} />
              </Field>

              <fieldset className="flex flex-col gap-3">
                <legend className="mb-2 text-sm font-medium">Lessons</legend>
                {draft.lessons.map((lesson, i) => (
                  <div key={lesson.id} className="flex flex-col gap-2 rounded-lg border border-border bg-surface-muted/50 p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted">{i + 1}</span>
                      <Input aria-label={`Lesson ${i + 1} title`} placeholder="Lesson title" value={lesson.title} onChange={(e) => updateLesson(lesson.id, { title: e.target.value })} />
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        aria-label={`Remove lesson ${i + 1}`}
                        disabled={draft.lessons.length === 1}
                        onClick={() => setDraft((d) => ({ ...d, lessons: d.lessons.filter((l) => l.id !== lesson.id) }))}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                    <Textarea aria-label={`Lesson ${i + 1} content`} placeholder="Lesson content" rows={3} value={lesson.content} onChange={(e) => updateLesson(lesson.id, { content: e.target.value })} />
                  </div>
                ))}
                <Button type="button" variant="secondary" size="sm" className="w-fit" onClick={() => setDraft((d) => ({ ...d, lessons: [...d.lessons, emptyLesson()] }))}>
                  <Plus className="size-4" aria-hidden="true" />
                  Add lesson
                </Button>
              </fieldset>

              <div className="flex gap-2 border-t border-border pt-4">
                <Button type="submit">{isEditing ? 'Save changes' : 'Publish course'}</Button>
                {isEditing && (
                  <Button type="button" variant="ghost" onClick={() => setDraft(emptyCourse())}>Cancel</Button>
                )}
              </div>
            </form>
          ) : (
            <form onSubmit={onSubmitJSON} className="flex flex-col gap-4">
              <Field label="Course JSON" htmlFor="c-json" hint="Lesson ids and course id are generated if omitted. Reusing an existing id overwrites that course.">
                <Textarea id="c-json" rows={14} className="font-mono text-xs" placeholder={JSON_EXAMPLE} value={json} onChange={(e) => setJson(e.target.value)} />
              </Field>
              <div className="flex gap-2">
                <Button type="submit" disabled={!json.trim()}>Import course</Button>
                <Button type="button" variant="ghost" onClick={() => setJson(JSON_EXAMPLE)}>Insert example</Button>
              </div>
            </form>
          )}
        </Card>

        <Card className="h-fit lg:col-span-2">
          <h2 className="border-b border-border px-5 py-4 text-lg font-semibold">{`Published (${courses.length})`}</h2>
          {courses.length === 0 ? (
            <EmptyState icon={BookOpen} title="No courses yet" />
          ) : (
            <ul className="divide-y divide-border">
              {courses.map((c) => (
                <li key={c.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="flex min-w-0 flex-col">
                    <span className="truncate text-sm font-medium">{c.title}</span>
                    <span className="text-xs text-muted">{`${c.lessons.length} lessons · ${c.pointsPerLesson} pts each`}</span>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="ghost" aria-label={`Edit ${c.title}`} onClick={() => edit(c)}>
                      <Pencil className="size-4" aria-hidden="true" />
                    </Button>
                    <Button size="sm" variant="danger" aria-label={`Delete ${c.title}`} onClick={() => remove(c)}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
