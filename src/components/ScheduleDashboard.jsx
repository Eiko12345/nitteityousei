import { useState } from 'react'
import { pieces } from '../data/pieces'
import { fixedDates, timeSlots } from '../data/fixedSchedule'
import './ScheduleDashboard.css'

const weekdays = ['日', '月', '火', '水', '木', '金', '土']
const markClass = { '○': 'yes', '△': 'maybe', '×': 'no' }

const dateLabel = (value) => {
  const [year, month, day] = value.split('-').map(Number)
  return `${year}年${month}月${day}日（${weekdays[new Date(year, month - 1, day).getDay()]}）`
}

const partLabel = (part, piece) => {
  if (Number(part) === piece?.assistantPart) return 'assi.'
  if (part === '1') return '1st'
  if (part === '2') return '2nd'
  if (part === '3') return '3rd'
  return `${part}th`
}

function ScheduleDashboard({ responses, onAdd, onEdit, onDelete }) {
  const [detail, setDetail] = useState(null)
  const [showManagement, setShowManagement] = useState(false)

  const getMembers = (piece) =>
    responses.filter((response) => response.parts[piece.id])

  const getStatus = (piece, date, start) => {
    const members = getMembers(piece)
    if (members.length === 0) return ''

    const answers = members.map(
      (member) => member.availability[`${date}-${start}`] || '',
    )

    if (answers.every((answer) => answer === '○')) return '○'
    return '×'
  }

  return (
    <main className="dashboard-page">
      <header className="dashboard-top">
        <div>
          <p className="dashboard-kicker">ORCHESTRA SCHEDULE</p>
          <h1>パート練習日程</h1>
          <p>2026年8月12日〜10月3日・9:00〜22:00</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="manage-schedule-button" onClick={() => setShowManagement(true)}>入力済み予定を変更・削除</button>
          <button className="add-schedule-button" onClick={onAdd}>＋ 予定を追加する</button>
        </div>
      </header>

      <section className="dashboard-card">
        <div className="dashboard-section-title">
          <div><h2>曲ごとの練習可能時間</h2></div>
        </div>
        <p className="dashboard-guide">日付をクリックすると、その日における全員の回答を曲ごとに確認できます。</p>

        {fixedDates.map((date) => (
          <div className="date-schedule-block" key={date}>
            <button className="date-detail-button" onClick={() => setDetail({ date })}>
              <span>{dateLabel(date)}</span>
              <span>全員の予定を見る →</span>
            </button>
            <div className="dashboard-scroll">
              <div className="timeline-row timeline-hours">
                <strong>曲</strong>
                <div className="timeline">
                  {timeSlots.map(({ start }) => <span key={start}>{start}</span>)}
                </div>
              </div>
              {pieces.map((piece) => (
                <div className="timeline-row" key={piece.id}>
                  <strong>{piece.name}<small>{getMembers(piece).length}人</small></strong>
                  <div className="timeline">
                    {timeSlots.map(({ start, end }) => {
                      const value = getStatus(piece, date, start)
                      return (
                        <span
                          className={`timeline-cell ${markClass[value] || ''}`}
                          key={start}
                          title={`${piece.name} ${start}〜${end} ${value || '回答者なし'}`}
                        >
                          {value}
                        </span>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {detail && (
        <div className="detail-backdrop" role="presentation" onClick={() => setDetail(null)}>
          <section className="schedule-detail" role="dialog" aria-modal="true" aria-labelledby="detail-title" onClick={(event) => event.stopPropagation()}>
            <button className="detail-close" onClick={() => setDetail(null)} aria-label="閉じる">×</button>
            <p className="dashboard-kicker">SCHEDULE DETAIL</p>
            <h2 id="detail-title">{dateLabel(detail.date)}</h2>
            <p>曲ごとのメンバー予定</p>
            <div className="detail-timetables">
              {pieces.map((piece) => (
                <section className="detail-piece" key={piece.id}>
                  <h3>{piece.name}</h3>
                  <div className="detail-timeline-scroll">
                    <div className="timeline-row timeline-hours">
                      <strong>名前・パート</strong>
                      <div className="timeline">{timeSlots.map(({ start }) => <span key={start}>{start}</span>)}</div>
                    </div>
                    {getMembers(piece).length === 0 ? (
                      <p className="detail-empty">この曲の回答者はいません。</p>
                    ) : getMembers(piece).map((member) => (
                      <div className="timeline-row" key={member.id}>
                        <strong>{member.name}<small>{partLabel(member.parts[piece.id], piece)}</small></strong>
                        <div className="timeline">
                          {timeSlots.map(({ start }) => {
                            const answer = member.availability[`${detail.date}-${start}`] === '○' ? '○' : '×'
                            return <span className={`timeline-cell ${markClass[answer] || ''}`} key={start}>{answer}</span>
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </section>
        </div>
      )}

      {showManagement && (
        <div className="detail-backdrop" role="presentation" onClick={() => setShowManagement(false)}>
          <section className="schedule-detail response-management" role="dialog" aria-modal="true" aria-labelledby="management-title" onClick={(event) => event.stopPropagation()}>
            <button className="detail-close" onClick={() => setShowManagement(false)} aria-label="閉じる">×</button>
            <p className="dashboard-kicker">MANAGE RESPONSES</p>
            <h2 id="management-title">入力済みの予定</h2>
            <p>変更または削除する回答者を選んでください。</p>
            {responses.length === 0 ? (
              <p className="management-empty">入力済みの予定はありません。</p>
            ) : (
              <ul className="response-management-list">
                {responses.map((response) => (
                  <li key={response.id}>
                    <span>
                      <b>{response.name}</b>
                      <small>{pieces.filter((piece) => response.parts[piece.id]).map((piece) => `${piece.name} ${partLabel(response.parts[piece.id], piece)}`).join(' / ') || '乗り番なし'}</small>
                    </span>
                    <span className="management-actions">
                      <button className="edit-response-button" onClick={() => onEdit(response)}>変更</button>
                      <button
                        className="delete-response-button"
                        onClick={() => {
                          if (window.confirm(`${response.name}さんの予定を削除しますか？`)) onDelete(response.id)
                        }}
                      >
                        削除
                      </button>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </main>
  )
}

export default ScheduleDashboard
