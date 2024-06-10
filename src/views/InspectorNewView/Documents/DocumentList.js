import { format } from 'date-fns'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import { NavLink } from 'react-router-dom'

import { AddIcon, DownloadIcon } from '../../../assets/icons'
import { BasicLayout, BasicTable, BtnFiled, Header, Tabs, Pagination, MuiTabs } from '../../../components'
import { useDocument, useObject } from '../../../services'
import { permissions } from '../../../settings/permissions'
import Switch from '../../../components/Switch'
import fileDownloader from '../../../utils/fileDownloader'
import dateFormatter from '../../../utils/dateFormatter'
import {
  BOSH_LABARATORIYA_ROLE_ID,
  LABARATORIYA_BOSHLIGI_ROLE_ID,
  YETAKCHI_LABARATORIYA_ROLE_ID,
} from '../../../settings/constants'
import DocumentAddMenuList from '../../../components/DocumentAddMenuList'

export function DocumentListV2() {
  const { id } = useParams()
  const { roleId } = useSelector((state) => state.auth)
  const navigate = useNavigate()
  const isLabarant =
    roleId === BOSH_LABARATORIYA_ROLE_ID || LABARATORIYA_BOSHLIGI_ROLE_ID || YETAKCHI_LABARATORIYA_ROLE_ID
  const [activeTab, setActiveTab] = useState(0)
  const [offset, setOffset] = useState(1)
  const [limit, setLimit] = useState(10)

  const { documents, updateDocArchiveMutation, actProtocols } = useDocument({
    updateDocArchiveProps: { onSuccess: () => documents.refetch() },
    documentsQueryProps: {
      enabled: true,
    },
    actProtocolsQueryProps: {
      enabled: activeTab === 1,
    },
    offset,
    limit,
    objectId: id,
    is_achived: activeTab === 2,
  })

  const headData = [
    {
      title: '№',
      key: 'order',
    },
    {
      title: 'Nomi',
      key: 'name',
    },
    {
      title: 'Hujjat sanasi',
      key: 'created_at',
      render: (value) => dateFormatter(format, new Date(value), 'dd.MM.yyyy'),
    },
    {
      title: 'Hujjat raqami',
      key: 'doc_number',
    },
    {
      title: 'Fayl',
      key: 'file',
      render: (val) =>
        val ? (
          <div
            className="flex justify-between items-center"
            onClick={(e) => {
              e.stopPropagation()
              fileDownloader(val)
              // downloadItForMe({ bucketName: 'files', expiresAt: 1, filename: val })
            }}
          >
            <span>{`${val.slice(0, 20)}...${val.split('.')[val.split('.').length - 1]}`}</span>
            <div className="px-3 py-1 bg-blue-100 rounded-md">
              <DownloadIcon />
            </div>
          </div>
        ) : (
          <></>
        ),
    },
    {
      title: 'Holati',
      key: 'id',
      render: (val) => (
        <span onClick={(e) => e.stopPropagation()}>
          <Switch
            defaultChecked={activeTab === 1}
            onChange={(e) => {
              updateDocArchiveMutation.mutate({
                id: val,
                is_achived: e,
              })
            }}
          />
        </span>
      ),
    },
  ]

  const listTabLinks = [
    {
      key: 0,
      title: 'Hujjatlar',
    },
    {
      key: 1,
      title: 'Labaratoriya hujjatlar',
    },
    {
      key: 2,
      title: 'Arxivlangan hujjatlar',
    },
  ]

  return (
    <div className="sidebar-header-calc">
      <BasicLayout
        header={
          <MuiTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            elements={listTabLinks}
            getParamsFromLocation={false}
          />
        }
        title="Hujjatlar"
        rightElement={
          permissions[roleId]?.includes('OBJECTS/DOCUMENTS/ADD') &&
          !isLabarant && (
            <NavLink to="add">
              <BtnFiled color="blue" leftIcon={<AddIcon />}>
                Fayl yuklash
              </BtnFiled>
            </NavLink>
          )
        }
        footer={
          <Pagination
            count={documents?.data?.count}
            pageCount={limit}
            onChange={(pageNumber) => setOffset(pageNumber)}
            currentPage={offset}
            onChangeLimit={(limitNumber) => {
              setLimit(limitNumber)
            }}
            limit={limit}
          />
        }
      >
        <BasicTable
          headColumns={
            permissions[roleId]?.includes('OBJECTS/DOCUMENTS/ARCHIVE')
              ? headData
              : headData.filter((i) => i.key !== 'id')
          }
          desiredRowName="id"
          desiredRowName2="lab_type"
          clickHandler={(id, lab_type) => {
            activeTab === 1 && permissions[roleId]?.includes('OBJECTS/DOCUMENTS/EDIT')
              ? navigate(`${lab_type}/${id}`)
              : permissions[roleId]?.includes('OBJECTS/DOCUMENTS/EDIT') && navigate(`${id}`)
          }}
          bodyColumns={activeTab === 1 ? actProtocols?.data?.act_test : documents?.data?.object_docs}
          isLoading={documents.isLoading}
        />
      </BasicLayout>
    </div>
  )
}