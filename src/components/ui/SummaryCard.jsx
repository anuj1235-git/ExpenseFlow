export default function SummaryCard( {
  title,
  value,
  icon:Icon,
  meta,
  positive=true
}
) {
  return <div className="summary-card"><div className="summary-icon"><Icon size= {
    20
  }
/></div><div><p> {
  title
}
</p><h3> {
  value
}
</h3><small className= {
  positive?'positive':'negative'
}
> {
  meta
}
</small></div></div>
}
