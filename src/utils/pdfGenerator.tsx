import { pdf, Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import type { WorksheetTask, Parcel, Batch, User } from '@/types'

// Register fonts — using system serif fallback
Font.registerHyphenationCallback((word) => [word])

const styles = StyleSheet.create({
  page: {
    padding: 48,
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#C9BEB5',
  },
  logoText: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1814',
    letterSpacing: 2,
  },
  logoSubtext: {
    fontSize: 8,
    color: '#7A8C6E',
    letterSpacing: 3,
    marginTop: 3,
    fontFamily: 'Helvetica',
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerDate: {
    fontSize: 11,
    fontFamily: 'Helvetica',
    color: '#6B6560',
  },
  headerTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1814',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  sectionLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
    color: '#6B6560',
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5DED6',
    marginLeft: 12,
  },
  taskRow: {
    marginBottom: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE3',
  },
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 1,
    borderColor: '#C9BEB5',
    marginTop: 1,
    flexShrink: 0,
  },
  taskTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#1A1814',
    flex: 1,
  },
  taskMeta: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: '#6B6560',
    marginTop: 4,
    marginLeft: 20,
  },
  notesLine: {
    marginTop: 6,
    marginLeft: 20,
  },
  notesLabel: {
    fontSize: 8,
    fontFamily: 'Helvetica',
    color: '#A8A29E',
  },
  notesRule: {
    height: 1,
    backgroundColor: '#E5DED6',
    marginTop: 10,
  },
  dataFields: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 6,
    marginLeft: 20,
  },
  dataField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dataLabel: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#A8A29E',
  },
  dataValue: {
    fontSize: 8,
    fontFamily: 'Courier',
    color: '#1A1814',
    borderBottomWidth: 1,
    borderBottomColor: '#C9BEB5',
    minWidth: 36,
    paddingBottom: 2,
  },
  footer: {
    position: 'absolute',
    bottom: 36,
    left: 48,
    right: 48,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F0EBE3',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    fontFamily: 'Helvetica',
    color: '#C9BEB5',
  },
})

interface PDFProps {
  date: string
  tasks: WorksheetTask[]
  parcels: Parcel[]
  batches: Batch[]
  users: User[]
}

function WorksheetDocument({ date, tasks, parcels, batches, users }: PDFProps) {
  const formatted = new Date(date).toLocaleDateString('en-AU', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })

  const getParcel = (id?: string) => parcels.find((p) => p.id === id)
  const getBatch = (id?: string) => batches.find((b) => b.id === id)
  const getUser = (id?: string) => users.find((u) => u.id === id)

  const vineyardTasks = tasks.filter((t) => t.type === 'vineyard-pick' || t.type === 'vineyard-task')
  const cellarTasks = tasks.filter((t) => t.type === 'cellar-test' || t.type === 'cellar-action')
  const otherTasks = tasks.filter((t) => t.type === 'custom')

  const renderTask = (task: WorksheetTask) => {
    const parcel = getParcel(task.parcelId)
    const batch = getBatch(task.batchId)
    const user = getUser(task.assignedUserId)

    return (
      <View key={task.id} style={styles.taskRow}>
        <View style={styles.taskHeader}>
          <View style={styles.checkbox} />
          <Text style={styles.taskTitle}>
            {task.description || (batch ? `${batch.batchId}${batch.nickname ? ` — ${batch.nickname}` : ''}` : 'Task')}
          </Text>
        </View>
        <Text style={styles.taskMeta}>
          {user ? `Assigned: ${user.name}` : ''}
          {parcel ? `   Parcel: ${parcel.name}` : ''}
          {batch ? `   Batch: ${batch.batchId}` : ''}
        </Text>

        {task.type === 'cellar-test' && (
          <View style={styles.dataFields}>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>pH</Text>
              <Text style={styles.dataValue}>{task.ph || '      '}</Text>
            </View>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Baume</Text>
              <Text style={styles.dataValue}>{task.baume || '      '}</Text>
            </View>
            <View style={styles.dataField}>
              <Text style={styles.dataLabel}>Temp °C</Text>
              <Text style={styles.dataValue}>{task.temp || '      '}</Text>
            </View>
          </View>
        )}

        <View style={styles.notesLine}>
          <Text style={styles.notesLabel}>Notes</Text>
          <View style={styles.notesRule} />
          {task.notes ? <Text style={{ fontSize: 9, fontFamily: 'Helvetica', color: '#1A1814', marginTop: 2 }}>{task.notes}</Text> : null}
        </View>
      </View>
    )
  }

  const renderSection = (label: string, sectionTasks: WorksheetTask[]) => {
    if (sectionTasks.length === 0) return null
    return (
      <View>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>{label}</Text>
          <View style={styles.sectionLine} />
        </View>
        {sectionTasks.map(renderTask)}
      </View>
    )
  }

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logoText}>NGERINGA</Text>
            <Text style={styles.logoSubtext}>Adelaide Hills · Biodynamic</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerDate}>{formatted}</Text>
            <Text style={styles.headerTitle}>Daily Worksheet — Contrada</Text>
          </View>
        </View>

        {/* Sections */}
        {renderSection('Vineyard', vineyardTasks)}
        {renderSection('Cellar', cellarTasks)}
        {renderSection('Other', otherTasks)}

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Contrada · Ngeringa Estate</Text>
          <Text style={styles.footerText}>{date}</Text>
        </View>
      </Page>
    </Document>
  )
}

export async function generateWorksheetPDF(props: PDFProps) {
  const blob = await pdf(<WorksheetDocument {...props} />).toBlob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `worksheet-${props.date}.pdf`
  a.click()
  URL.revokeObjectURL(url)
}
