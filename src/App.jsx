import { useEffect, useState } from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore'

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

  const [responses, setResponses] = useState([])
  const [editingResponseId, setEditingResponseId] = useState(null)

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'responses'),
      (snapshot) => {
        setResponses(snapshot.docs.map((responseDoc) => ({
          id: responseDoc.id,
          ...responseDoc.data(),
        })))
      },
      (error) => {
        console.error('Firestoreから回答を取得できませんでした', error)
      },
    )

    return unsubscribe
  }, [])

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

  const deleteResponse = async (id) => {
    try {
      await deleteDoc(doc(db, 'responses', id))
    } catch (error) {
      console.error('Firestoreから回答を削除できませんでした', error)
      alert('回答の削除に失敗しました。通信環境を確認して、もう一度お試しください。')
    }
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
