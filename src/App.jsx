import { useEffect, useState } from 'react'
import { doc, serverTimestamp, setDoc } from 'firebase/firestore'

import AvailabilityInput from './components/AvailabilityInput'
import ScheduleDashboard from './components/ScheduleDashboard'
import { fixedScheduleCandidates } from './data/fixedSchedule'
import { db } from './firebase/firebase'

function App() {
  const [step, setStep] = useState(0)

  const [name, setName] = useState('')

  const [parts, setParts] = useState({
    first: '',
    middle: '',
    main: '',
  })

  const [
    availability,
    setAvailability,
  ] = useState({})

  const [responses, setResponses] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('orchestra-responses')) || []
    } catch {
      return []
    }
  })
  const [editingResponseId, setEditingResponseId] = useState(null)

  useEffect(() => {
    localStorage.setItem('orchestra-responses', JSON.stringify(responses))
  }, [responses])

  const startResponse = () => {
    setEditingResponseId(null)
    setName('')
    setParts({ first: '', middle: '', main: '' })
    setAvailability({})
    setStep(1)
  }

  const editResponse = (response) => {
    setEditingResponseId(response.id)
    setName(response.name)
    setParts({ ...response.parts })
    setAvailability({ ...response.availability })
    setStep(1)
  }

  const deleteResponse = (id) => {
    setResponses((current) => current.filter((response) => response.id !== id))
  }

  const saveResponse = async (response) => {
    const responseId = editingResponseId || crypto.randomUUID()
    const completeAvailability = Object.fromEntries(
      fixedScheduleCandidates.map(({ id }) => [
        id,
        response.availability[id] === '○' ? '○' : '×',
      ]),
    )
    const savedResponse = {
      ...response,
      name: response.name.trim(),
      availability: completeAvailability,
    }

    await setDoc(doc(db, 'responses', responseId), {
      name: savedResponse.name,
      parts: savedResponse.parts,
      availability: savedResponse.availability,
      createdAt: serverTimestamp(),
    })

    setResponses((current) => editingResponseId
      ? current.map((item) => item.id === editingResponseId
        ? { ...savedResponse, id: editingResponseId }
        : item)
      : [...current, { ...savedResponse, id: responseId }])
    setEditingResponseId(null)
    setStep(0)
  }

  return (
    <div>
      {step === 0 && (
        <ScheduleDashboard
          responses={responses}
          onAdd={startResponse}
          onEdit={editResponse}
          onDelete={deleteResponse}
        />
      )}

      {step === 1 && (
        <AvailabilityInput
          name={name}
          setName={setName}
          parts={parts}
          setParts={setParts}
          availability={availability}
          setAvailability={
            setAvailability
          }
          setStep={setStep}
          onSubmit={saveResponse}
        />
      )}

    </div>
  )
}

export default App
