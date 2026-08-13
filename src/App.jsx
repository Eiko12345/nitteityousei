import { useEffect, useState } from 'react'

import AvailabilityInput from './components/AvailabilityInput'
import ScheduleDashboard from './components/ScheduleDashboard'

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

  const saveResponse = (response) => {
    setResponses((current) => editingResponseId
      ? current.map((item) => item.id === editingResponseId
        ? { ...response, id: editingResponseId }
        : item)
      : [...current, { ...response, id: crypto.randomUUID() }])
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
