import AnswerCard from './AnswerCard'

// One turn in the conversation thread: the question the user asked, plus
// the answer that came back. QueryPage renders one of these per completed
// turn, oldest first, by mapping over its `turns` array — same
// .map()+key pattern as CitationList, just one level up.
function QueryTurn({ turn }) {
  return (
    <div>
      <div className="mt-6 flex justify-end">
        <p className="bg-indigo-600 text-white rounded-2xl rounded-tr-sm px-4 py-2.5 max-w-[80%] text-sm shadow-sm">
          {turn.query}
        </p>
      </div>
      <AnswerCard result={turn.result} />
    </div>
  )
}

export default QueryTurn
