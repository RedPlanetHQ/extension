import { Button } from "~/components/ui/button"

interface ApprovalComponentProps {
  onApprove: () => void
  onReject: () => void
}

export function ApprovalComponent({ onApprove, onReject }: ApprovalComponentProps) {
  return (
    <div className="ce-flex ce-gap-2 ce-py-2">
      <Button size="sm" onClick={onApprove}>
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={onReject}>
        Reject
      </Button>
    </div>
  )
}
